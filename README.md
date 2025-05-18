# ButorWebaruhaz

Pontozási segédlet

Menj biztosra és ellenőrizd!

# Adatmodell definiálása (legalább 4 TypeScript interfész vagy class formájában (ugyanennyi kollekció))
- models / category
- models / furniture
- models / order
- models / user

# Reszponzív, mobile-first felület (minden adat látható és jól jelenik meg böngészőben is, mobil nézetben is)
- elviekben az

# Legalább 4, de 2 különböző attribútum direktíva használata
- products.component.ts 20:             <mat-select [(value)]="selectedCategory" (selectionChange)="loadFurniture()">
- products.component.ts 30:             <mat-select [(value)]="sortBy" (selectionChange)="loadFurniture()">
- profile.component.ts 21:              <input matInput [(ngModel)]="lastname" name="lastname" required />
- profile.component.ts 26:              <input matInput [(ngModel)]="firstname" name="firstname" required />

# Legalább 4, de 2 különböző beépített vezérlési folyamat használata (if, switch, for)
- app.component.html 18:           @if (isLoggedIn) 
- products.component.html 47:      @if (isAdmin)
- cart.component.html 24:          @for (item of items; track item.furniture.id; let i = $index) 
- home.component.html 20:      @for (furniture of lowStockFurnitures; track furniture.id)

# Adatátadás szülő és gyermek komponensek között (legalább 3 @Input és 3 @Output)
- furniture-card.component.ts 25:          @Input() furniture!: Furniture;
- furniture-card.component.ts 26:          @Input() isAdmin: boolean = false;
- furniture-card.component.ts 27:          @Input() isLoggedIn: boolean = false;
- furniture-card.component.ts 30:          @Output() addToCart = new EventEmitter<Furniture>();
- furniture-card.component.ts 31:          @Output() edit = new EventEmitter<Furniture>();
- furniture-card.component.ts 32:          @Output() delete = new EventEmitter<string>();

# Legalább 10 különböző Material elem helyes használata.
- app.component.html 1:            mat-sidenav-container
- app.component.html 6:            mat-toolbar
- cart.component.html 10:          mat-card
- cart.component.html 11:          mat-card-header
- cart.component.html 23:          mat-list
- cart.component.html 25:          mat-list-item
- cart.component.html 30:          button mat-icon-button
- login.component.html 18:         mat-label
- login.component.html 23:         mat-form-field appearance="outline"
- products.component.html 20:      mat-select

# Legalább 2 saját Pipe osztály írása és használata
- pipes / simple-currency      furniture-card.component.html 19:       <p>Ár: {{ furniture.price | simpleCurrency }}</p>
- pipes / stock-status         furniture-card.component.html 20:       <p>{{ furniture.quantity | stockStatus }}</p>

# Adatbevitel Angular form-ok segítségével megvalósítva (legalább 4)
- login.component.html 16:         <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="filter-controls">
- register.component.html 16:         <form [formGroup]="registerForm" (ngSubmit)="register()" class="filter-controls">
- profile.component.html 17:         <form (submit)="updateUser(); $event.preventDefault()" class="filter-controls">
- products.component.html 91:         <form [formGroup]="form" (ngSubmit)="save()">

# Legalább 2 különböző Lifecycle Hook használata a teljes projektben (értelmes tartalommal, nem üresen)
- cart.component.ts 43:          async ngOnInit()
- app.component.ts 41:          ngOnDestroy(): void

# CRUD műveletek mindegyike megvalósult legalább a projekt fő entitásához (Promise, Observable használattal)
- services / furniture: CRUD

# CRUD műveletek service-ekbe vannak kiszervezve és megfelelő módon injektálva lettek
- Igen

# Legalább 4 komplex Firestore lekérdezés megvalósítása (ide tartoznak: where feltétel, rendezés, léptetés, limitálás)
- furniture.service.ts 65:            async getFilteredFurniture
- furniture.service.ts 84:            async getLowStockFurnitures
- order.service.ts 54:                async getUnconfirmedOrder
- user.service.ts 29:                 async fetchUserAndOrders

# Legalább 4 különböző route a különböző oldalak eléréséhez
- app.routes.ts:
               - home
               - products
               - profile
               - cart

# AuthGuard implementációja
- guards / auth

# Legalább 2 route levédése azonosítással (AuthGuard) (ahol ennek értelme van, pl.: egy fórum témakör megtekinthető bárki számára, de a regisztrált felhasználó adatai nem)
- app.routes.ts:
                - cart
                - profile

# Szubjektív pontozás a projekt egészére vonatkozólag (mennyire fedi le a projekt a témakört (mennyire kapcsolódik hozzá), mennyi lehet a befektetett energia a projektben)
- amennyit gondolsz :)



