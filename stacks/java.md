# ☕ JAVA — Spring Boot / Quarkus

> **Hexagonal spine:** [clean-code.md](./clean-code.md). This file maps it.
> `.NET` users: [dotnet.md](./dotnet.md). Nothing else for C#.

---

## 🎯 Versions

| Piece | Version |
| --- | --- |
| Java | 21+ (LTS). Records + sealed + pattern matching |
| Spring Boot | 3.4+ (Jakarta namespace, `jakarta.*`) |
| Quarkus | 3.15+ (Jakarta + native image) |
| Build | Maven or Gradle. Pick one, never both |

---

## 📂 Package layout (feature-first, not layer-first)

```text
com.app.billing/
├── domain/                  # pure. no Spring, no JPA
│   ├── Invoice.java              # record or class with invariants
│   ├── Money.java                # value object
│   └── InvoiceRepository.java    # INTERFACE
├── application/
│   └── CreateInvoiceUseCase.java # one file per use case
├── adapter/
│   ├── inbound/  CreateInvoiceResource.java   # @RestController | @Resource
│   └── outbound/ JpaInvoiceRepository.java    # implements the interface
└── config/                   # wiring only
```

**Never** `controller/`, `service/`, `repository/` as top-level packages. That layout
forces every feature to touch 3 folders for one change.

---

## 🚨 Rules

1. **Records for DTOs and value objects.** `class` only when behaviour + identity.
2. **Invariants in the constructor.** `new Money(-1)` must not compile or must throw.
3. **`sealed` for closed hierarchies** + pattern matching in `switch`. No visitor class.
4. **`Optional` for return values only.** Never a field, never a parameter.
5. **No `null`.** Domain rejects it at the boundary. Prefer `Optional` or a sealed error.
6. **`var` in tests only.** Explicit types in production.
7. **Lombok sparingly.** Never `@Data` on an entity — it hides equals/hashCode bugs.
8. **No field injection.** Constructor injection, always. `@Autowired` on fields breaks
   `final` and testability.
9. **Transactions at the use case boundary,** not in repositories.
10. **No `equals` on JPA entities.** Use business identity in a value object.

---

## ☘ Spring Boot

| Concern | Do | Never |
| --- | --- | --- |
| Controller | `@RestController` thin, calls one use case | logic, `@Transactional`, ORM |
| Service | none at top level — `application/` holds use cases | `XxxService` god classes |
| Repository | interface in `domain/`, impl in `adapter/outbound/` | Spring Data interface in `domain/` |
| Mapping | MapStruct or explicit mapper | reflection-based BeanUtils |
| Config | `application.yml`, profiles, `@ConfigurationProperties` | values hardcoded |
| Validation | `@Valid` at the HTTP edge, domain enforces the rest | validation only in controller |
| Errors | `@RestControllerAdvice` mapping domain errors to codes | try/catch in every controller |
| Events | Spring `@EventListener` at the adapter edge | events crossing into `domain/` |

**Constructor injection only:**
```java
@RestController
class CreateInvoiceResource {
    private final CreateInvoiceUseCase useCase;

    CreateInvoiceResource(CreateInvoiceUseCase useCase) {   // no @Autowired
        this.useCase = useCase;
    }
}
```

---

## 🏃 Quarkus

Same shape as Spring. Differences that matter:

| Concern | Quarkus |
| --- | --- |
| Injection | `@Inject` constructor, still not fields. Prefer plain constructor wiring |
| Build-time | Panache is **discouraged** in the domain. Use plain JPA/repositories behind interfaces |
| Config | `application.properties`, `%dev`/`%prod` profiles |
| Native image | keep reflection out: no dynamic proxies in `domain/`, register serializers |
| Testing | `@QuarkusTest` for integration; plain JUnit for `domain/` and `application/` |

**Native image rule:** anything reflected on must be registered at build time
(`@RegisterForReflection`). Domain code with reflection will fail only in native build —
so keep reflection at the adapter edge.

---

## 🧪 Testing

| Layer | Tool | No mocks |
| --- | --- | --- |
| `domain/` | JUnit 5 | ever |
| `application/` | JUnit 5 + hand-written fake repo | ever |
| `adapters/` | Testcontainers (Postgres, Kafka) | real infra |
| HTTP | `@WebMvcTest` / `@QuarkusTest` + RestAssured | — |

```java
class CreateInvoiceUseCaseTest {
    private final FakeInvoiceRepository repo = new FakeInvoiceRepository();
    private final CreateInvoiceUseCase useCase = new CreateInvoiceUseCase(repo, clock);

    @Test
    void rejects_invoice_without_lines() {
        assertThatThrownBy(() -> useCase.execute(new Invoice("id-1", List.of())))
            .isInstanceOf(InvalidInvoice.class);
    }
}
```

**Fakes over mocks.** A hand-written fake repository is a compile-time contract. Mockito
is runtime and hides signature drift.

---

## 🚫 Smells specific to Java

| Smell | Fix |
| --- | --- |
| `@SpringBootApplication` scanning the whole codebase | scan only the composition root |
| Entity as DTO returned to HTTP | map to a response record in the adapter |
| `@Transactional` on `save()` only | transaction per use case |
| Cyclic beans | that is a design problem, not a DI problem |
| Static utility with 30 methods | one class per operation |
| `if (type == A) ... else if (type == B)` | sealed + pattern matching |

---

## 📎 Commands

```bash
./mvnw test                      # or ./gradlew test
./mvnw -Dtest=CreateInvoiceUseCaseTest test
./mvnw verify                    # includes coverage gate
```
