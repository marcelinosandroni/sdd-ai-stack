# 🅰️ ANGULAR

> **Angular is a framework with opinions. Follow them or leave.**
> Language: [javascript.md](./javascript.md). Spine: [clean-code.md](./clean-code.md).

---

## 🎯 Versions

| Piece | Version |
| --- | --- |
| Angular | 20+ (signals stable) |
| State | signals + `signal()`, `computed()`, `store`. NgRx only if the team already does |
| Forms | Reactive Forms. Template forms are legacy |
| HTTP | `HttpClient` + interceptors |
| Change detection | `OnPush` everywhere |

---

## 🚨 Rules

1. **Standalone components only.** No `NgModule`. `standalone: true` is the default —
   if you write it, you are on the old way.
2. **`OnPush` on every component.** Zone-less or zone-ful, `OnPush` is non-negotiable.
3. **Signals, not `BehaviorSubject`, not fields.** Template reads `sig()`; writes only via
   `set()`/`update()`.
4. **`input()` / `output()` signal APIs**, not `@Input()`/`@Output()`.
5. **One component per file.** `create-feature/…/components/invoice-card.component.ts`.
6. **`ChangeDetectionStrategy.OnPush` in the decorator**, not a lint rule.
7. **No `async` pipe when a signal works.** It forces a second CD pass.
8. **Never subscribe in a component for data you can `resource()`/`httpResource()`.**
   Async pipe in a template keeps the subscription in the component's lifetime — that is a
   leak waiting for a destroyed route.
9. **Template: no logic.** No `*ngIf` chains, no method calls that compute. Use `@if`,
   `@for` (with `track`), and `computed()`.
10. **`track` is mandatory in `@for`.** Without it, the DOM is rebuilt on every change.
11. **No `ngClass` with a giant object.** `[class.x]` and `[class]="computedClass()"`.
12. **DI: `inject()` at field initialisation**, or constructor param. No `@Inject` token
    strings.
13. **One service per use case**, not `DataService`. A service that fetches five things
    is a God service.
14. **No `any`.** `unknown` + a type guard, or a typed DTO.
15. **Route lazy loading:** `loadComponent`, never a barrel import of a page.

---

## 📂 Layout

```text
src/app/
├── core/                  # singletons, interceptors, guards. NOT business logic
│   ├── auth/
│   ├── http/
│   └── config/
├── features/
│   └── billing/
│       ├── domain/            # models, pure. no Angular
│       ├── data-access/       # one service per use case
│       ├── components/        # one component per file
│       └── routes.ts
└── shared/
    └── ui/                   # generic, presentational only
```

**`core/` is for cross-cutting infra. Feature logic never goes there.** The moment
`core/` imports a feature, you have a cycle.

---

## 🎯 Signals

```ts
@Component({
  selector: "app-invoice-list",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-skeleton />
    } @else {
      @for (invoice of invoices(); track invoice.id) {
        <app-invoice-card [invoice]="invoice" />
      }
    }
  `,
})
export class InvoiceList {
  private readonly http = inject(HttpClient);

  readonly loading = signal(false);
  private readonly invoicesSignal = signal<Invoice[]>([]);

  // computed, not a getter with work inside
  readonly total = computed(() =>
    this.invoicesSignal().reduce((sum, i) => sum + i.amountMinor, 0),
  );

  readonly invoices = this.invoicesSignal.asReadonly();   // no external writes
}
```

**`asReadonly()` on every signal that leaves a component.** A public writable signal lets
any caller corrupt state, and nothing tells you who did it.

---

## 🔌 HTTP

| Concern | Do | Never |
| --- | --- | --- |
| Base URL | `HttpClient` with an interceptor, one config token | hardcoded URLs scattered |
| Auth header | interceptor reading a token service | per-component `headers` |
| Error mapping | interceptor translating to typed errors | `catchError` per call |
| DTO ↔ domain | mapper function per resource | `JSON.parse(JSON.stringify())` as a "mapper" |
| Loading state | signal in the service, read in the template | a boolean per component |

---

## 🧪 Testing

| Layer | Tool | Notes |
| --- | --- | --- |
| Domain | Vitest | plain, no TestBed |
| Service | `HttpTestingController` | assert the exact request URL and body |
| Component | `TestBed` with `OnPush` | query by `data-testid`, not CSS classes |
| E2E | Playwright | the real user flow |

```ts
it("maps the 201 response to an invoice", () => {
  const http = TestBed.inject(HttpClient);
  const backend = TestBed.inject(HttpTestingController);
  const service = TestBed.inject(CreateInvoice);

  service.execute({ id: "id-1", lines: [] }).subscribe();

  const request = backend.expectOne("/invoices");
  expect(request.request.method).toBe("POST");
  request.flush({ id: "id-1" }, { status: 201, statusText: "Created" });
  backend.verify();
});
```

`backend.verify()` at the end of every HTTP test. Without it, a leaked request passes
silently.

---

## 🚫 Smells specific to Angular

| Smell | Fix |
| --- | --- |
| `NgModule` | standalone component |
| Default change detection | `OnPush` |
| `BehaviorSubject` + `async` pipe | `signal()` |
| A service that fetches 5 endpoints | one service per use case |
| `ngClass` object with 8 keys | `[class.x]` bindings |
| `@for` without `track` | `track item.id` |
| Logic in the template | `computed()` |
| `any` on a DTO | typed interface |
| Lazy module with a barrel import | `loadComponent` |
| `providedIn: 'root'` on a stateful service | provide it in the feature route |

---

## 📎 Commands

```bash
ng build
ng test --watch=false
ng lint
ng e2e
```
