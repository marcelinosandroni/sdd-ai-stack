# 🐍 PYTHON — Django / FastAPI

> **Hexagonal spine:** [clean-code.md](./clean-code.md). This file maps it.
> Python needs the most discipline, not the least. Dynamism erodes structure.

---

## 🎯 Versions

| Piece | Version |
| --- | --- |
| Python | 3.12+ (`type` statements, generics, `match`) |
| Django | 5.2 LTS |
| FastAPI | 0.115+ |
| ORM | SQLAlchemy 2.x (Django: the built-in ORM) |
| Validation | Pydantic v2 at the boundary |
| Types | `pyright` or `mypy --strict` |

---

## 📂 Layout — FastAPI (explicit hexagonal)

```text
src/billing/
├── domain/
│   ├── invoice.py            # entity + invariants (dataclass or plain class)
│   ├── money.py              # value object
│   └── repository.py         # Protocol / ABC
├── application/
│   └── create_invoice.py     # use case, takes a repository instance
├── adapters/
│   ├── inbound/  create_invoice_route.py
│   └── outbound/ sqlalchemy_invoice_repository.py
├── schemas/                  # Pydantic request/response models
└── main.py                   # composition root
```

---

## 📂 Layout — Django

Django is opinionated: ORM in models, ORM touching views. **Do not fight it — add the
seam only where it pays.**

```text
billing/
├── models.py            # Django ORM. It IS the domain persistence
├── domain/              # pure value objects + invariants. No Django import
├── services.py          # ONE CLASS PER USE CASE. Not a God service
├── selectors.py         # read side. Querysets live here, never in views
├── api/
│   ├── serializers.py
│   ├── views.py         # thin
│   └── urls.py
└── admin.py
```

Rule: `models.py` may import `domain/`. `domain/` never imports `models`.

---

## 🚨 Rules

1. **`from __future__ import annotations` never needed** on 3.12+. Use PEP 604 `X | None`.
2. **Type everything.** `def f(x: int) -> str`. Mypy strict in CI. No `# type: ignore`
   without a linked reason.
3. **`Protocol` over `ABC`** for interfaces — structural, no inheritance lock-in.
   `class InvoiceRepository(Protocol): ...`
4. **No mutable default arguments.** `def f(items: list[str] = [])` is a classic bug.
   Use `None` + a new list.
5. **`dataclass(frozen=True, slots=True)`** for value objects. Free immutability.
6. **Context managers for every resource.** `with open(...)`, `with session.begin():`.
7. **Never `except:` bare, never `except Exception: pass`.** Catch what you handle,
   re-raise with `raise ... from e`.
8. **No `datetime.now()` in domain code.** Inject `clock` / take `now` as a parameter.
9. **Pydantic at the boundary only.** Domain objects are not Pydantic models.
10. **No module-level mutable singletons.** No `global`.
11. **One function per file when it is a use case.** Django's `services.py` holds classes,
    one per file.
12. **No f-string SQL, ever.** Parameterised queries only.
13. **`__all__` in modules with many public names** — makes the API explicit.
14. **Never `import *`.**

---

## 🥱 Django specifics

| Concern | Do | Never |
| --- | --- | --- |
| Queryset in view | `from .selectors import get_invoices` | `Model.objects.filter(...)` in the view |
| Business logic | `services.py`, one class per use case | logic in the view or the model `save()` |
| Migrations | Generated, reviewed, committed | `makemigrations` in prod |
| `select_related` / `prefetch_related` | always, for FK/M2M | N+1 in production |
| Model `save()` override | rare, justified | hiding business rules |
| Settings | `settings/` module, env-driven | values in the code |
| N+1 | `assertNumQueries` in tests | discovering it in prod |
| Transaction | `with transaction.atomic():` around one use case | `ATOMIC_REQUESTS=True` as a blanket |
| Signals | cross-cutting only, after the fact | core business flow |

**Signals are the anti-pattern of Django.** They hide the flow. A use case that must
trigger something calls it explicitly.

---

## ⚡ FastAPI specifics

| Concern | Do | Never |
| --- | --- | --- |
| Route | thin: `Depends` for auth, call use case | logic in the path function |
| Schema | Pydantic per request AND per response | returning an ORM model directly |
| Response | explicit `response_model` | leaking every column |
| Auth | `Depends(get_current_user)` | reading the token in the handler |
| DI | `Depends` for I/O adapters, wired in one module | `Depends` inside `domain/` |
| Errors | exception handlers registered once | try/except in every route |
| Blocking I/O | `def` route + `run_in_threadpool`, or `async def` + async driver | `async def` calling blocking code |

**The last row kills production.** A blocking DB call inside `async def` blocks the whole
event loop.

---

## 🧪 Testing

| Layer | Tool | Mocks |
| --- | --- | --- |
| Domain | `pytest` | none |
| Use case | `pytest` + hand-written fake repo | none |
| Repository | Testcontainers (Postgres) | real |
| HTTP | `pytest` + `httpx`/`TestClient` | — |
| Django views | `pytest-django`, `assertNumQueries` | — |

```python
def test_create_invoice_rejects_empty_lines() -> None:
    repository = InMemoryInvoiceRepository()
    use_case = CreateInvoice(repository, clock=lambda: datetime(2026, 1, 1, tzinfo=UTC))

    with pytest.raises(InvalidInvoice):
        use_case.execute(CreateInvoiceInput(invoice_id="id-1", lines=[]))

    assert repository.saved == []
```

`mocker.patch` is a smell. If you need it, the dependency is inverted wrong.

---

## 🚫 Smells specific to Python

| Smell | Fix |
| --- | --- |
| `utils.py` with 40 functions | one module per responsibility |
| `views.py` with a queryset and a loop | `services.py` + `selectors.py` |
| Circular import between `models` and `services` | extract to `domain/` |
| `except Exception: pass` | catch narrowly or delete the try |
| Mutable default argument | `None` + construct |
| `**kwargs` forwarded everywhere | explicit parameters |
| `globals()` | pass dependencies explicitly |
| Class with no method but 8 attributes | dataclass |
| Monkeypatching in tests | inject the dependency |
| `settings.AUTH_USER_MODEL` imported at module top | import inside the function when needed |

---

## 📎 Commands

```bash
pytest
pytest --cov=src --cov-report=term-missing
pytest -x -q                     # stop at first failure
mypy --strict src/
ruff check src/ && ruff format src/
python manage.py makemigrations --check   # CI: no missing migrations
```
