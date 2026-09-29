# #️⃣ C# / .NET

> **.NET only.** For C# there is no Mono, no .NET Framework. One runtime.
> **Hexagonal spine:** [clean-code.md](./clean-code.md). This file maps it.

---

## 🎯 Versions

| Piece | Version |
| --- | --- |
| Runtime | .NET 10 LTS (or 9 STS) |
| Language | C# 13/14 — records, primary constructors, collection expressions |
| Web | ASP.NET Core minimal APIs or controllers (pick one per project) |
| ORM | EF Core 9+ |
| Test | xUnit v3 + FluentAssertions, or Assert |

---

## 📂 Layout (feature-first)

```text
src/Billing/
├── Domain/
│   ├── Invoice.cs                     # entity, invariants in ctor
│   ├── Money.cs                       # record struct value object
│   └── IInvoiceRepository.cs          # INTERFACE
├── Application/
│   └── CreateInvoiceHandler.cs        # one file per use case
├── Adapters/
│   ├── Inbound/  CreateInvoiceEndpoint.cs
│   └── Outbound/ InvoiceRepository.cs  # EF Core impl
└── DependencyInjection/                # the only composition root
```

---

## 🚨 Rules

1. **`record` for DTOs, value objects, events.** `class` only for entities with identity
   + mutable state.
2. **Invariants in the constructor**, enforced with `ArgumentException.ThrowIf*`.
3. **Nullable reference types ON.** `#nullable enable`. `string` is not `string?`.
4. **No `null` in domain.** `Optional<T>` (real package) or a result type.
5. **`sealed` by default** on classes. `internal` unless another assembly needs it.
6. **Constructor injection only.** `Microsoft.Extensions.DependencyInjection` service
   lifetimes: `Scoped` for use cases, `Singleton` only for stateless thread-safe services,
   never `Scoped` in a `Singleton`.
7. **Async all the way.** `async Task<T>`, `CancellationToken` as a parameter, not a
   default. **Never `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()`.**
8. **Primary constructors** for simple single-dependency classes.
9. **`var` when the type is obvious from the right side.** Explicit otherwise.
10. **EF Core DbContext stays in `Adapters/Outbound`.** Never in domain or application.
11. **No `Entity<T>` from Clean Architecture templates in the domain.** Domain has no EF
    dependency at all.

---

## 🧱 Minimal API vs MVC controllers

| Use | Minimal API | MVC controller |
| --- | --- | --- |
| Default for new projects | ✅ | |
| Model binding, filters, complex | | ✅ |
| Needs `[ApiController]` conventions | | ✅ |

Rules either way:
- Endpoint class per resource, one static method per action.
- Request/response **records** in `Contracts/`, never the entity.
- Validation: DataAnnotations or FluentValidation at the edge. Domain re-checks the
  invariants that matter.
- ProblemDetails for errors. A global exception handler maps domain exceptions once.

```csharp
public sealed class CreateInvoiceEndpoint : IEndpoint
{
    public void Map(IEndpointRouteBuilder app)
    {
        app.MapPost("/invoices", async (
            CreateInvoiceRequest request,
            ICreateInvoiceHandler handler,
            CancellationToken ct) =>
        {
            var result = await handler.Handle(request, ct);
            return result.IsSuccess
                ? Results.Created($"/invoices/{result.Value.Id}", result.Value)
                : Results.Problem(result.Error);
        });
    }
}
```

---

## 🗄️ EF Core

| Rule | Why |
| --- | --- |
| One `DbContext` per bounded context | avoids accidental coupling |
| Explicit `Include` | N+1 otherwise |
| `AsNoTracking()` on read-only queries | perf |
| Migrations reviewed in PR | schema change is a contract change |
| Never call `SaveChanges` in repositories | the unit of work is the use case |
| Value converters for `Money` in the config | keeps the domain type intact |
| `sealed` entity + private setters | protects invariants |

---

## 🧪 Testing

| Layer | Tool | Mocks |
| --- | --- | --- |
| Domain | xUnit, plain | none |
| Application | xUnit + `InMemoryInvoiceRepository` (hand-written) | none |
| Adapters | Testcontainers (Postgres) | real infra |
| HTTP | `WebApplicationFactory` | — |

```csharp
public sealed class CreateInvoiceHandlerTests
{
    [Fact]
    public async Task Rejects_invoice_without_lines()
    {
        var repository = new InMemoryInvoiceRepository();
        var handler = new CreateInvoiceHandler(repository, TimeProvider.System);

        var result = await handler.Handle(new CreateInvoiceRequest("id-1", []), default);

        Assert.False(result.IsSuccess);
        Assert.IsType<InvalidInvoice>(result.Error);
    }
}
```

**Fakes over mocking frameworks.** NSubstitute/Moq hide signature drift; a hand-written
fake is a compile-time contract.

---

## 🚫 Smells specific to C#

| Smell | Fix |
| --- | --- |
| `.Result` / `.Wait()` in production | deadlock risk. Propagate `async` |
| God service injected everywhere | split per use case |
| DTO = entity | contract record in `Adapters/Inbound/Contracts` |
| `ServiceCollection` configured in 5 files | one composition root |
| `public` everything | `internal` default |
| `static` mutable state | inject, or a singleton with immutability |
| Exceptions for control flow in hot paths | `Result<T>` |

---

## 📎 Commands

```bash
dotnet build
dotnet test
dotnet test --filter "FullyQualifiedName~CreateInvoiceHandler"
dotnet ef migrations add AddInvoice --project src/Billing
```
