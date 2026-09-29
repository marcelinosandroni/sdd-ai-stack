# 🐹 GO

> **Hexagonal spine:** [clean-code.md](./clean-code.md). This file maps it.
> Idiomatic Go **is** the architecture. Resist Java habits.

---

## 🎯 Versions

| Piece | Version |
| --- | --- |
| Go | 1.23+ (generics, range-over-func) |
| Router | chi or net/http stdlib |
| ORM | sqlc (over GORM) or sqlx |
| Validation | `go-playground/validator` or hand-rolled |
| Test | stdlib `testing` + `testify` only when it earns it |

> **sqlc over GORM.** Generated, type-safe, no runtime reflection. GORM hides the SQL and
> makes N+1 invisible.

---

## 📂 Layout

```text
internal/
├── billing/
│   ├── invoice.go             # entity + invariants
│   ├── money.go               # value type
│   ├── repository.go          # INTERFACE
│   ├── create_invoice.go      # use case
│   └── repository_sql.go      # sqlc impl (adapter)
├── platform/
│   ├── postgres/              # pool, tx helper
│   └── httpx/                 # server, middleware
├── cmd/api/main.go            # composition root: the only place wiring happens
└── gen/                       # sqlc generated. do not edit
```

`internal/` by default. Export only what other modules import.

---

## 🚨 Rules

1. **`package` = one concern, one responsibility.** No `utils` package. Ever.
2. **Errors: `if err != nil`. Always check. No `_` discard on a real call.**
3. **Wrap with context, keep the chain:**
   ```go
   if err != nil {
       return fmt.Errorf("create invoice: %w", err)
   }
   ```
4. **No `panic` outside `main` and `init`.** Return errors.
5. **Accept interfaces, return structs.** Never return an interface.
6. **`context.Context` first parameter**, always. Propagate it. Never `context.Background()`
   in library code — only at the top (main/handler).
7. **Constructor returns error:** `func NewInvoice(...) (*Invoice, error)`.
8. **Zero value must be valid** or the type must be explicitly constructed. No partially
   initialised structs.
9. **Goroutine: one owner.** Whoever starts it finishes it. Use `errgroup` for fan-out.
   Never leak goroutines.
10. **Mutex zero-value usable; copy a struct with a mutex = bug.**
11. **Table-driven tests.** Always.
12. **`defer` immediately after the error check, nothing between.**

---

## 🎯 Concurrency

| Rule | Detail |
| --- | --- |
| Ownership | One goroutine owns a value until it hands it over via channel |
| Channels | For transferring ownership, not for locking |
| `sync.Mutex` | Guard a small critical section. Copy = bug, pass `*T` |
| `sync.RWMutex` | Only after a profile shows contention |
| `atomic` | Single counter/flag. Avoid scattered atomics |
| Fan-out | `errgroup.Group` + `Wait()`, or `WaitGroup` + error channel |
| Leaks | `defer close(ch)`; buffered channels sized to the fan-out count |
| Context | Every blocking call takes `ctx`. Timeouts at the boundary |

```go
func (s *Service) FetchAll(ctx context.Context, ids []string) ([]Invoice, error) {
    g, ctx := errgroup.WithContext(ctx)
    out := make([]Invoice, len(ids))

    for i, id := range ids {
        g.Go(func() error {
            inv, err := s.repo.Find(ctx, id)
            if err != nil {
                return fmt.Errorf("find invoice %s: %w", id, err)
            }
            out[i] = inv
            return nil
        })
    }
    if err := g.Wait(); err != nil {
        return nil, err
    }
    return out, nil
}
```

---

## 🗄️ Data & transactions

- **Transaction at the use case boundary.** Pass `*sql.Tx` into the repository method
  instead of storing a tx on the struct.
- **Never** `defer tx.Rollback()` inside a loop. One rollback at the end.
- **Context deadline** on every query. A stuck query must not hold a request forever.

---

## 🧪 Testing

| Layer | Approach | Mocks |
| --- | --- | --- |
| Domain | Plain `testing`, table-driven | none |
| Use case | Hand-written fake repo (a small struct) | none |
| Repository | `testcontainers-go` real Postgres | real |
| HTTP | `httptest.NewServer` | — |

```go
func TestCreateInvoice(t *testing.T) {
    tests := []struct {
        name    string
        lines   []Line
        wantErr error
    }{
        {name: "accepts invoice with lines", lines: []Line{{"widget", 2}}, wantErr: nil},
        {name: "rejects empty invoice", lines: nil, wantErr: ErrNoLines},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            repo := NewFakeRepository()
            err := NewCreateInvoice(repo, clockFixed).Run(context.Background(), tt.lines)
            if !errors.Is(err, tt.wantErr) {
                t.Fatalf("got %v, want %v", err, tt.wantErr)
            }
        })
    }
}
```

**Parallel subtests** with `t.Parallel()` when the test has no shared state.

---

## 🚫 Smells specific to Go

| Smell | Fix |
| --- | --- |
| `utils.go` / `helpers.go` | one file per function, named by action |
| Package `common` | delete it. It is always a cycle waiting to happen |
| Interface with 1 implementation "for mocking" | accept the concrete type; test the real thing |
| `if err != nil { return err }` with no context | wrap with `%w` and the operation name |
| Goroutine started, never joined | owner joins or the process leaks |
| `panic` in a request handler | return an error, map it centrally |
| Struct field tags duplicating validation | validate once at the edge |
| Global var for config | explicit constructor param |
| `interface{}` / `any` in a signature | define the interface you need |

---

## 📎 Commands

```bash
go build ./...
go test ./...
go test -race ./...          # always. catches data races
go test -run TestCreateInvoice -v ./internal/billing
go vet ./...
golangci-lint run
```
