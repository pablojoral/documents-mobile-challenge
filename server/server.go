package main

import (
	"encoding/json"
	"flag"
	"log"
	"math/rand"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/brianvoe/gofakeit/v5"
	"github.com/gorilla/websocket"
)

var (
	addr              = flag.String("addr", "0.0.0.0:8080", "http service address")
	fakeNotifications = flag.Bool("fakeNotifications", true, "emit fake random notifications instead of real document-creation events")
	upgrader          = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
	documents   []document
	documentsMu sync.RWMutex

	notifyClients   = make(map[*notifyClient]struct{})
	notifyClientsMu sync.Mutex
)

type notifyClient struct {
	send chan *message
}

type message struct {
	Timestamp     time.Time
	UserID        string
	UserName      string
	DocumentID    string
	DocumentTitle string
}

type user struct {
	ID   string
	Name string
}

type document struct {
	ID           string
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Title        string
	Attachments  []string
	Contributors []user
	Version      string
}

type documentsPage struct {
	Data    []document
	Page    int
	Limit   int
	Total   int
	HasMore bool
}

type createDocumentRequest struct {
	Title        string
	Version      string
	Attachments  []string
	Contributors []user
}

func notifications(w http.ResponseWriter, r *http.Request) {
	addHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("write:", err)
		return
	}
	defer c.Close()

	if *fakeNotifications {
		notificationsFake(c)
		return
	}
	notificationsReal(c)
}

func notificationsFake(c *websocket.Conn) {
	for {
		msg := &message{
			Timestamp:     time.Now(),
			UserID:        gofakeit.UUID(),
			UserName:      gofakeit.Name(),
			DocumentID:    gofakeit.UUID(),
			DocumentTitle: gofakeit.BeerName(),
		}

		if err := c.WriteJSON(msg); err != nil {
			log.Println("write:", err)
			break
		}

		time.Sleep(time.Duration(rand.Intn(5)) * time.Second)
	}
}

func notificationsReal(c *websocket.Conn) {
	client := &notifyClient{send: make(chan *message, 8)}
	registerClient(client)
	defer unregisterClient(client)

	done := make(chan struct{})
	go func() {
		defer close(done)
		for {
			if _, _, err := c.ReadMessage(); err != nil {
				return
			}
		}
	}()

	for {
		select {
		case msg, ok := <-client.send:
			if !ok {
				return
			}
			if err := c.WriteJSON(msg); err != nil {
				log.Println("write:", err)
				return
			}
		case <-done:
			return
		}
	}
}

func registerClient(c *notifyClient) {
	notifyClientsMu.Lock()
	notifyClients[c] = struct{}{}
	notifyClientsMu.Unlock()
}

func unregisterClient(c *notifyClient) {
	notifyClientsMu.Lock()
	delete(notifyClients, c)
	notifyClientsMu.Unlock()
	close(c.send)
}

func broadcastNotification(msg *message) {
	notifyClientsMu.Lock()
	defer notifyClientsMu.Unlock()
	for c := range notifyClients {
		select {
		case c.send <- msg:
		default: // slow/stuck client — drop rather than block the broadcaster
		}
	}
}

func newRandomDocument() document {
	var attachments []string
	for j := 0; j <= 1+rand.Intn(4); j++ {
		attachments = append(attachments, gofakeit.BeerStyle())
	}

	var contributors []user
	for j := 0; j <= 1+rand.Intn(4); j++ {
		contributors = append(contributors, user{
			ID:   gofakeit.UUID(),
			Name: gofakeit.Name(),
		})
	}

	return document{
		ID:           gofakeit.UUID(),
		CreatedAt:    gofakeit.Date(),
		UpdatedAt:    gofakeit.Date(),
		Title:        gofakeit.BeerName(),
		Attachments:  attachments,
		Contributors: contributors,
		Version:      gofakeit.AppVersion(),
	}
}

func seedDocuments(n int) []document {
	docs := make([]document, 0, n)
	for i := 0; i < n; i++ {
		docs = append(docs, newRandomDocument())
	}
	return docs
}

func sortDocuments(docs []document, sortKey string) []document {
	sorted := make([]document, len(docs))
	copy(sorted, docs)

	switch sortKey {
	case "title-asc":
		sort.Slice(sorted, func(i, j int) bool {
			return strings.ToLower(sorted[i].Title) < strings.ToLower(sorted[j].Title)
		})
	case "created-asc":
		sort.Slice(sorted, func(i, j int) bool {
			return sorted[i].CreatedAt.Before(sorted[j].CreatedAt)
		})
	default: // "created-desc" and any unrecognized value
		sort.Slice(sorted, func(i, j int) bool {
			return sorted[i].CreatedAt.After(sorted[j].CreatedAt)
		})
	}

	return sorted
}

func api(w http.ResponseWriter, r *http.Request) {
	addHeaders(w)
	if r.Method == "OPTIONS" {
		return
	}

	switch r.Method {
	case http.MethodGet:
		listDocuments(w, r)
	case http.MethodPost:
		createDocument(w, r)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func listDocuments(w http.ResponseWriter, r *http.Request) {
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil || limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	documentsMu.RLock()
	sorted := sortDocuments(documents, r.URL.Query().Get("sort"))
	documentsMu.RUnlock()

	start := (page - 1) * limit
	if start > len(sorted) {
		start = len(sorted)
	}
	end := start + limit
	if end > len(sorted) {
		end = len(sorted)
	}

	pageItems := sorted[start:end]
	if pageItems == nil {
		pageItems = []document{}
	}

	resp := documentsPage{
		Data:    pageItems,
		Page:    page,
		Limit:   limit,
		Total:   len(sorted),
		HasMore: end < len(sorted),
	}

	enc := json.NewEncoder(w)
	enc.Encode(resp)
}

func createDocument(w http.ResponseWriter, r *http.Request) {
	var req createDocumentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.Title) == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}

	now := time.Now()
	doc := document{
		ID:           gofakeit.UUID(),
		CreatedAt:    now,
		UpdatedAt:    now,
		Title:        req.Title,
		Attachments:  req.Attachments,
		Contributors: req.Contributors,
		Version:      req.Version,
	}

	documentsMu.Lock()
	documents = append(documents, doc)
	documentsMu.Unlock()

	if !*fakeNotifications {
		broadcastNotification(newDocumentMessage(doc))
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(doc)
}

func newDocumentMessage(doc document) *message {
	userID, userName := "", "unknown"
	if len(doc.Contributors) > 0 {
		userID = doc.Contributors[0].ID
		userName = doc.Contributors[0].Name
	}

	return &message{
		Timestamp:     time.Now(),
		UserID:        userID,
		UserName:      userName,
		DocumentID:    doc.ID,
		DocumentTitle: doc.Title,
	}
}

func addHeaders(w http.ResponseWriter) {
	w.Header().Add("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func main() {
	seed := time.Now().UnixNano()
	rand.Seed(seed)
	gofakeit.Seed(seed)

	documents = seedDocuments(100)

	log.Println("Starting server on", *addr)

	flag.Parse()
	http.HandleFunc("/notifications", notifications)
	http.HandleFunc("/documents", api)

	log.Fatal(http.ListenAndServe(*addr, nil))
}
