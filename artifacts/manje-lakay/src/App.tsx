import { type ReactNode, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Compass,
  Heart,
  Home as HomeIcon,
  ImagePlus,
  Loader2,
  Minus,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Trash2,
  Truck,
  UtensilsCrossed,
  X,
  XCircle,
} from "lucide-react";
import {
  getGetMerchantOverviewQueryKey,
  getListMealsQueryKey,
  getListOrdersQueryKey,
  useCreateMeal,
  useCreateOrder,
  useDeleteMeal,
  useGetMerchantOverview,
  useListMeals,
  useListOrders,
  useUpdateMeal,
  useUpdateOrderStatus,
  type Meal,
  type MealInput,
  type Order,
  type OrderInput,
} from "@workspace/api-client-react";
import { Route, Switch, Router as WouterRouter, Link, useLocation } from "wouter";

type Category = "Tout" | "Plat peyi" | "Ti dejene" | "Diri & sòs" | "Bwason";
type FoodItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  place: string;
  eta: string;
  rating: string;
  image: string;
  tone: string;
  available: boolean;
};
type CartLine = FoodItem & { quantity: number };
type MealForm = {
  name: string;
  description: string;
  category: string;
  price: string;
  photoUrl: string;
  available: boolean;
  restaurantName: string;
  phoneNumber: string;
  deliveryArea: string;
  rating: string;
  eta: string;
};

const queryClient = new QueryClient();
const categories: { name: Category; icon: typeof UtensilsCrossed }[] = [
  { name: "Tout", icon: Sparkles },
  { name: "Plat peyi", icon: UtensilsCrossed },
  { name: "Ti dejene", icon: Store },
  { name: "Diri & sòs", icon: PackageCheck },
  { name: "Bwason", icon: Heart },
];
const tones = ["bg-[#e4a353]", "bg-[#ca7040]", "bg-[#d6a43f]", "bg-[#5f7952]", "bg-[#c8a84f]", "bg-[#91a65e]"];
const fallbackMeals: FoodItem[] = [
  { id: 1, name: "Soup joumou", description: "Vyann bèf, legim, makawoni", price: 475, category: "Plat peyi", place: "Lakou Manje", eta: "25–35 min", rating: "4.9", image: "/soup-joumou.jpg", tone: tones[0], available: true },
  { id: 2, name: "Griyo & bannann", description: "Chou pikliz, sòs ti piman", price: 650, category: "Plat peyi", place: "Chez Tati", eta: "30–40 min", rating: "4.8", image: "", tone: tones[1], available: true },
  { id: 3, name: "Akra lakay", description: "6 moso, sòs mayi", price: 250, category: "Ti dejene", place: "Mango Café", eta: "15–25 min", rating: "4.7", image: "", tone: tones[2], available: true },
  { id: 4, name: "Diri djondjon", description: "Pwa nwa, poul boukannen", price: 575, category: "Diri & sòs", place: "Kreyòl Kitchen", eta: "25–35 min", rating: "4.9", image: "", tone: tones[3], available: true },
  { id: 5, name: "Banann peze", description: "Poul fri, pikliz fre", price: 390, category: "Plat peyi", place: "Lakou Manje", eta: "25–35 min", rating: "4.6", image: "", tone: tones[4], available: true },
  { id: 6, name: "Jis chadèk", description: "Frèch, san twòp sik", price: 180, category: "Bwason", place: "Mango Café", eta: "15–20 min", rating: "4.8", image: "", tone: tones[5], available: true },
];
const fallbackOrders: Order[] = [
  { id: 101, customerName: "Nadia Pierre", customerPhone: "37 11 24 90", deliveryAddress: "Delmas 33, bò legliz la", paymentMethod: "moncash", status: "pending", items: [{ mealId: 1, mealName: "Soup joumou", quantity: 2, unitPrice: 475, lineTotal: 950 }], subtotal: 950, serviceFee: 45, total: 995, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 102, customerName: "Jean-Luc Étienne", customerPhone: "48 22 10 09", deliveryAddress: "Pétion-Ville, Rue Panaméricaine", paymentMethod: "cash", status: "accepted", items: [{ mealId: 2, mealName: "Griyo & bannann", quantity: 1, unitPrice: 650, lineTotal: 650 }], subtotal: 650, serviceFee: 45, total: 695, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
];
const fallbackOverview = { mealCount: 6, availableMealCount: 6, pendingOrderCount: 1, acceptedOrderCount: 1, totalRevenue: 695 };

const money = (amount: number) => new Intl.NumberFormat("fr-FR").format(amount).replace(/\u202f/g, " ");
const toFoodItem = (meal: Meal): FoodItem => ({
  id: meal.id, name: meal.name, description: meal.description, price: meal.price, category: meal.category,
  place: meal.restaurantName, eta: meal.eta || "25–35 min", rating: meal.rating || "4.8", image: meal.photoUrl || "",
  tone: tones[meal.id % tones.length], available: meal.available,
});
const emptyMealForm: MealForm = {
  name: "", description: "", category: "Plat peyi", price: "", photoUrl: "", available: true,
  restaurantName: "", phoneNumber: "", deliveryArea: "", rating: "4.8", eta: "25–35 min",
};

function FoodArtwork({ item }: { item: FoodItem }) {
  if (item.image) return <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${item.image})` }} aria-label={`Foto ${item.name}`} />;
  return <div className={`absolute inset-0 overflow-hidden ${item.tone}`}><div className="absolute -right-6 -top-8 h-28 w-28 rounded-full border-[14px] border-white/15" /><div className="absolute -bottom-8 left-3 h-24 w-24 rounded-full bg-black/10" /><div className="absolute left-1/2 top-1/2 h-20 w-28 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-[46%] bg-[#f2d49c]/85 shadow-[0_12px_18px_rgba(55,31,11,.18)]" /><div className="absolute left-[42%] top-[40%] h-2 w-2 rounded-full bg-[#7b4d2a]/60 shadow-[18px_7px_#7b4d2a66,-12px_13px_#7b4d2a66,8px_-10px_#7b4d2a66]" /></div>;
}

function FoodCard({ item, onAdd }: { item: FoodItem; onAdd: (item: FoodItem) => void }) {
  return <article className="group overflow-hidden rounded-[1.35rem] border border-[#e9dfd0] bg-card shadow-[0_5px_18px_hsl(147_31%_15%_/_0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_32px_hsl(147_31%_15%_/_0.11)]" data-testid={`card-food-${item.id}`}>
    <div className="relative h-40 overflow-hidden"><FoodArtwork item={item} /><span className="absolute left-3 top-3 rounded-full bg-[#fff5cf]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#805b12]">{item.category}</span><button type="button" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#fffaf2]/85 text-[#6b5948] backdrop-blur hover:text-primary" aria-label={`Mete ${item.name} nan pi renmen`} data-testid={`button-favorite-${item.id}`}><Heart size={15} /></button></div>
    <div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-display text-lg leading-tight text-foreground">{item.name}</h3><p className="mt-1 text-xs text-muted-foreground">{item.description}</p><p className="mt-2 text-[11px] font-semibold text-secondary">{item.place}</p></div><p className="shrink-0 text-sm font-bold text-primary" data-testid={`text-price-${item.id}`}>{money(item.price)} G</p></div><div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3"><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><span className="flex items-center gap-1"><Star size={12} className="fill-[#e5a52b] text-[#e5a52b]" /> {item.rating}</span><span>·</span><span>{item.eta}</span></div><button type="button" onClick={() => onAdd(item)} disabled={!item.available} className="flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3.5 text-xs font-bold text-secondary-foreground transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50" data-testid={`button-add-${item.id}`}><Plus size={15} /> {item.available ? "Ajoute" : "Epwize"}</button></div></div>
  </article>;
}

function CheckoutDialog({ cart, onClose, onSuccess }: { cart: CartLine[]; onClose: () => void; onSuccess: (message: string) => void }) {
  const client = useQueryClient();
  const createOrder = useCreateOrder();
  const [form, setForm] = useState({ customerName: "", customerPhone: "", deliveryAddress: "", paymentMethod: "cash" as OrderInput["paymentMethod"] });
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const serviceFee = cart.length ? 45 : 0;
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    createOrder.mutate({ data: { ...form, items: cart.map((line) => ({ mealId: line.id, quantity: line.quantity })) } }, {
      onSuccess: () => { void client.invalidateQueries({ queryKey: getListOrdersQueryKey() }); void client.invalidateQueries({ queryKey: getGetMerchantOverviewQueryKey() }); onSuccess("Kòmand ou ale! N ap rele w pou konfime livrezon an."); },
      onError: () => onSuccess("Nou pa rive voye kòmand lan. Tanpri eseye ankò."),
    });
  };
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#173425]/35 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" data-testid="dialog-checkout">
    <form onSubmit={submit} className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-[#fffaf3] p-5 shadow-2xl sm:rounded-[2rem] sm:p-7"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Dènye etap</p><h2 className="mt-1 font-display text-3xl">Fini kòmand lan</h2><p className="mt-1 text-sm text-muted-foreground">{cart.length} atik · {money(subtotal + serviceFee)} G</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-border" aria-label="Fèmen fòm kòmand lan" data-testid="button-close-checkout"><X size={17} /></button></div>
      <div className="mt-6 space-y-4"><label className="block text-xs font-bold">Non ou<input required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="mt-1.5 h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" placeholder="Pa egzanp: Nadia Pierre" data-testid="input-customer-name" /></label><label className="block text-xs font-bold">Nimewo telefòn<input required value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="mt-1.5 h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" placeholder="37 00 00 00" data-testid="input-customer-phone" /></label><label className="block text-xs font-bold">Adrès livrezon<textarea required value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} className="mt-1.5 min-h-20 w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary" placeholder="Ri, katye, ak yon pwen referans" data-testid="input-delivery-address" /></label><label className="block text-xs font-bold">Kijan w ap peye<select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as OrderInput["paymentMethod"] })} className="mt-1.5 h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" data-testid="select-payment-method"><option value="cash">Lajan kach lè li rive</option><option value="moncash">MonCash</option><option value="natcash">NatCash</option></select></label></div>
      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm"><span className="text-muted-foreground">Total pou peye</span><strong className="text-lg text-primary">{money(subtotal + serviceFee)} G</strong></div><button type="submit" disabled={createOrder.isPending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60" data-testid="button-submit-order">{createOrder.isPending ? <Loader2 className="animate-spin" size={17} /> : <Check size={17} />} {createOrder.isPending ? "N ap voye..." : "Konfime kòmand lan"}</button></form>
  </div>;
}

function CartPanel({ cart, open, onClose, onChange, onCheckout }: { cart: CartLine[]; open: boolean; onClose: () => void; onChange: (id: number, delta: number) => void; onCheckout: () => void }) {
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const service = cart.length ? 45 : 0;
  return <><>{open && <button type="button" aria-label="Fèmen panyen an" className="fixed inset-0 z-40 cursor-default bg-[#173425]/25 backdrop-blur-[2px]" onClick={onClose} data-testid="button-close-cart-backdrop" />}</><aside className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[420px] flex-col bg-[#fffaf3] shadow-[-15px_0_45px_rgba(33,50,35,.14)] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`} aria-label="Panyen an" data-testid="panel-cart"><div className="flex items-center justify-between border-b border-border/80 px-5 py-5"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Manje Lakay</p><h2 className="font-display text-2xl">Panyen ou</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-border" aria-label="Fèmen panyen an" data-testid="button-close-cart"><X size={18} /></button></div>{!cart.length ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><div className="grid h-20 w-20 place-items-center rounded-full bg-[#f6e6c8] text-primary"><ShoppingBag size={30} /></div><h3 className="mt-5 font-display text-2xl">Panyen an vid</h3><p className="mt-2 max-w-[240px] text-sm leading-6 text-muted-foreground">Chwazi yon bon plat pou kòmanse kòmand ou.</p><button type="button" onClick={onClose} className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="button-browse-menu">Gade meni an</button></div> : <><div className="flex-1 space-y-3 overflow-y-auto p-5"><div className="mb-5 rounded-xl bg-[#eef3df] px-3.5 py-3 text-xs leading-5 text-secondary">Kòmand ou ap soti nan <strong>Delmas, Pòtoprens</strong></div>{cart.map((line) => <div key={line.id} className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3" data-testid={`cart-line-${line.id}`}><div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ${line.tone}`}><FoodArtwork item={line} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{line.name}</p><p className="mt-0.5 text-xs text-primary">{money(line.price)} G</p></div><div className="flex items-center gap-1 rounded-full bg-muted p-1"><button type="button" onClick={() => onChange(line.id, -1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-card" aria-label={`Retire yon ${line.name}`} data-testid={`button-decrease-${line.id}`}><Minus size={13} /></button><span className="w-5 text-center text-xs font-bold" data-testid={`text-quantity-${line.id}`}>{line.quantity}</span><button type="button" onClick={() => onChange(line.id, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-card text-secondary shadow-sm" aria-label={`Ajoute yon ${line.name}`} data-testid={`button-increase-${line.id}`}><Plus size={13} /></button></div></div>)}</div><div className="border-t border-border/80 bg-card p-5 safe-bottom"><div className="space-y-2 text-sm"><div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span data-testid="text-cart-subtotal">{money(subtotal)} G</span></div><div className="flex justify-between text-muted-foreground"><span>Frè sèvis</span><span>{money(service)} G</span></div><div className="mt-3 flex justify-between border-t border-border/70 pt-3 text-base font-bold"><span>Total</span><span className="text-primary" data-testid="text-cart-total">{money(subtotal + service)} G</span></div></div><button type="button" onClick={onCheckout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground" data-testid="button-checkout">Pase kòmand lan <ArrowRight size={17} /></button></div></>}</aside></>;
}

function Home() {
  const mealsQuery = useListMeals({ includeUnavailable: false });
  const [category, setCategory] = useState<Category>("Tout");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const meals = mealsQuery.data === undefined ? fallbackMeals : mealsQuery.data.map(toFoodItem);
  const filteredItems = useMemo(() => { const query = search.trim().toLowerCase(); return meals.filter((item) => (category === "Tout" || item.category === category) && (!query || `${item.name} ${item.description} ${item.place}`.toLowerCase().includes(query))); }, [category, meals, search]);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const addToCart = (item: FoodItem) => { setCart((current) => { const found = current.find((line) => line.id === item.id); return found ? current.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { ...item, quantity: 1 }]; }); setNotice(`${item.name} ajoute nan panyen ou`); };
  const changeCart = (id: number, delta: number) => setCart((current) => current.map((line) => line.id === id ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0));
  return <div className="noise-overlay min-h-dvh bg-background pb-24"><header className="relative z-20 border-b border-[#e9dfd0]/70 bg-[#fffaf3]/90 backdrop-blur-md"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="flex items-center gap-2.5" data-testid="link-logo-home"><span className="grid h-10 w-10 rotate-[-4deg] place-items-center rounded-[13px] bg-primary text-primary-foreground shadow-[0_5px_0_#b84b1d]"><UtensilsCrossed size={21} /></span><span className="font-display text-[23px] tracking-[-.03em] text-secondary">Manje <span className="text-primary">Lakay</span></span></Link><div className="hidden items-center gap-7 md:flex"><button type="button" onClick={() => document.getElementById("meni")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="button-nav-menu">Meni an</button><button type="button" onClick={() => setNotice("N ap chèche restoran ki pi pre ou yo")} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="button-location"><Compass size={16} /> Delmas, Pòtoprens <ChevronDown size={14} /></button><Link href="/merchant" className="flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary" data-testid="link-merchant"><Store size={16} /> Zòn restoran</Link></div><div className="flex items-center gap-2"><button type="button" aria-label="Notifikasyon" className="hidden h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-muted md:grid" data-testid="button-notifications"><Bell size={18} /></button><button type="button" onClick={() => setCartOpen(true)} className="relative flex h-10 items-center gap-2 rounded-full bg-secondary px-3.5 text-sm font-bold text-secondary-foreground" data-testid="button-open-cart"><ShoppingBag size={17} /><span className="hidden sm:inline">Panyen</span>{itemCount > 0 && <span className="absolute -right-1 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground" data-testid="badge-cart-count">{itemCount}</span>}</button></div></div></header><main><section className="mx-auto max-w-6xl px-5 pt-8 lg:px-8 lg:pt-14"><div className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-8 text-secondary-foreground sm:px-10 sm:py-12 lg:min-h-[330px] lg:px-14"><div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-[#c9d782]/15" /><div className="absolute bottom-[-80px] right-[28%] h-48 w-48 rounded-full bg-primary/20" /><div className="relative z-10 max-w-[600px] animate-rise-in"><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#d6e49e]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#dce9ac]"><span className="h-1.5 w-1.5 rounded-full bg-[#f4c94f]" /> Bonjou, vwazen</div><h1 className="font-display text-[2.8rem] leading-[.98] tracking-[-.045em] sm:text-6xl">Bon manje pa janm lwen.</h1><p className="mt-4 max-w-[440px] text-sm leading-6 text-[#d4e0c6] sm:text-base">Jwenn plat ou renmen yo, prepare ak kè pa moun nan katye w la.</p><div className="mt-7 flex max-w-[500px] items-center gap-2 rounded-2xl bg-[#fdf7ed] p-1.5 shadow-lg"><Search size={19} className="ml-3 shrink-0 text-[#839079]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Kisa ou ta renmen manje?" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-foreground outline-none placeholder:text-[#9a9b88]" data-testid="input-search-food" /><button type="button" onClick={() => document.getElementById("meni")?.scrollIntoView({ behavior: "smooth" })} className="rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground" data-testid="button-search-food">Chèche</button></div></div><div className="pointer-events-none absolute bottom-0 right-[-15px] hidden h-[280px] w-[285px] rounded-tl-[55%] bg-[#e7a858] opacity-90 lg:block"><div className="absolute left-[-40px] top-[55px] h-[160px] w-[260px] rotate-[-11deg] rounded-[45%] border-[18px] border-[#f6d9a0]/70 bg-[#c87943] shadow-[-14px_18px_0_#b6633a]" /></div></div></section><section className="mx-auto max-w-6xl px-5 pt-8 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">Chwazi sa w anvi</p><h2 className="mt-1 font-display text-2xl sm:text-3xl">Kisa k ap fè w plezi?</h2></div><span className="hidden text-xs text-muted-foreground sm:block">Bon jan gou, bò kote w</span></div><div className="-mx-5 mt-5 flex gap-2.5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">{categories.map(({ name, icon: Icon }) => <button type="button" key={name} onClick={() => setCategory(name)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold ${category === name ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`} data-testid={`button-category-${name.toLowerCase().replaceAll(" ", "-")}`}><Icon size={15} /> {name}</button>)}</div></section><section id="meni" className="mx-auto max-w-6xl px-5 pb-7 pt-8 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">Jodi a nan katye a</p><h2 className="mt-1 font-display text-2xl sm:text-3xl">Plat ki fè pale</h2></div><button type="button" onClick={() => { setCategory("Tout"); setSearch(""); }} className="flex items-center gap-1 text-xs font-bold text-secondary" data-testid="button-see-all">Wè tout <ArrowRight size={14} /></button></div>{mealsQuery.isLoading && meals.length === 0 ? <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((n) => <div key={n} className="h-64 animate-pulse rounded-[1.35rem] bg-muted" data-testid={`skeleton-meal-${n}`} />)}</div> : filteredItems.length ? <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredItems.map((item) => <FoodCard key={item.id} item={item} onAdd={addToCart} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center" data-testid="empty-search-state"><Search className="mx-auto text-muted-foreground" size={26} /><h3 className="mt-3 font-display text-xl">Pa gen plat sa a pou kounye a</h3><p className="mt-1 text-sm text-muted-foreground">Eseye yon lòt mo oswa gade tout meni an.</p><button type="button" onClick={() => { setCategory("Tout"); setSearch(""); }} className="mt-5 rounded-full bg-secondary px-5 py-2.5 text-xs font-bold text-secondary-foreground" data-testid="button-reset-search">Wè tout plat yo</button></div>}{mealsQuery.isError && <p className="mt-4 rounded-xl bg-[#fff1dc] px-4 py-3 text-xs text-[#805b12]" role="status" data-testid="status-meals-fallback">Meni an pa t ka chaje nèt; n ap montre kèk plat lakay pou kounye a.</p>}</section><section className="mx-auto max-w-6xl px-5 pb-10 lg:px-8"><div className="relative overflow-hidden rounded-[1.6rem] bg-[#f3dfac] px-6 py-7 sm:px-9"><div className="relative z-10 max-w-[540px]"><div className="flex items-center gap-2 text-primary"><Smartphone size={17} /><span className="text-[11px] font-bold uppercase tracking-[.14em]">Toujou avèk ou</span></div><h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">Kòmande pi vit depi ekran ou.</h2><p className="mt-2 max-w-[450px] text-sm leading-6 text-[#665338]">Jwenn bon manje ak yon sèl ti manyen, menm lè koneksyon an pa twò fò.</p></div></div></section></main><nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-[#fffaf3]/95 px-5 py-2.5 backdrop-blur-lg md:hidden safe-bottom"><div className="mx-auto flex max-w-md items-center justify-around"><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex flex-col items-center gap-1 text-primary" data-testid="button-bottom-home"><HomeIcon size={19} /><span className="text-[10px] font-bold">Akèy</span></button><button type="button" onClick={() => document.getElementById("meni")?.scrollIntoView({ behavior: "smooth" })} className="flex flex-col items-center gap-1 text-muted-foreground" data-testid="button-bottom-explore"><Compass size={19} /><span className="text-[10px] font-bold">Eksplore</span></button><button type="button" onClick={() => setCartOpen(true)} className="relative flex flex-col items-center gap-1 text-muted-foreground" data-testid="button-bottom-cart"><ShoppingBag size={19} /><span className="text-[10px] font-bold">Panyen</span>{itemCount > 0 && <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{itemCount}</span>}</button></div></nav>{notice && <div className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-full bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground shadow-lg" role="status" data-testid="status-notice">{notice}</div>}{cart.length > 0 && !cartOpen && <button type="button" onClick={() => setCartOpen(true)} className="fixed bottom-[82px] right-5 z-20 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-lg md:bottom-6" data-testid="button-floating-cart"><ShoppingBag size={16} /> {itemCount} atik <span className="ml-1 border-l border-white/30 pl-2">{money(total)} G</span></button>}<CartPanel cart={cart} open={cartOpen} onClose={() => setCartOpen(false)} onChange={changeCart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />{checkoutOpen && <CheckoutDialog cart={cart} onClose={() => setCheckoutOpen(false)} onSuccess={(message) => { setCheckoutOpen(false); setCart([]); setNotice(message); }} />}</div>;
}

function mealToForm(meal: Meal): MealForm {
  return { name: meal.name, description: meal.description, category: meal.category, price: String(meal.price), photoUrl: meal.photoUrl || "", available: meal.available, restaurantName: meal.restaurantName, phoneNumber: meal.phoneNumber, deliveryArea: meal.deliveryArea, rating: meal.rating || "4.8", eta: meal.eta || "25–35 min" };
}
function formToMeal(form: MealForm): MealInput {
  return { name: form.name.trim(), description: form.description.trim(), category: form.category, price: Number(form.price), photoUrl: form.photoUrl.trim() || null, available: form.available, restaurantName: form.restaurantName.trim(), phoneNumber: form.phoneNumber.trim(), deliveryArea: form.deliveryArea.trim(), rating: form.rating.trim(), eta: form.eta.trim() };
}

function MealEditor({ meal, onClose, onSaved }: { meal: Meal | null; onClose: () => void; onSaved: (message: string) => void }) {
  const createMeal = useCreateMeal();
  const updateMeal = useUpdateMeal();
  const [form, setForm] = useState<MealForm>(meal ? mealToForm(meal) : emptyMealForm);
  const pending = createMeal.isPending || updateMeal.isPending;
  const set = (key: keyof MealForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const data = formToMeal(form);
    const callbacks = { onSuccess: () => onSaved(meal ? "Plat la modifye." : "Nouvo plat la ajoute nan meni an."), onError: () => onSaved("Nou pa rive sove plat la. Verifye enfòmasyon yo.") };
    if (meal) updateMeal.mutate({ id: meal.id, data }, callbacks);
    else createMeal.mutate({ data }, callbacks);
  };
  const field = (key: keyof MealForm, label: string, placeholder: string, type = "text") => <label className="block text-xs font-bold">{label}<input required={["name", "price", "restaurantName", "phoneNumber", "deliveryArea"].includes(key)} type={type} value={String(form[key])} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" data-testid={`input-meal-${key}`} /></label>;
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#173425]/35 p-0 backdrop-blur-sm sm:items-center sm:p-5"><form onSubmit={submit} className="max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-[#fffaf3] p-5 shadow-2xl sm:rounded-[2rem] sm:p-7"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Katalòg restoran</p><h2 className="mt-1 font-display text-3xl">{meal ? "Modifye plat la" : "Ajoute yon plat"}</h2><p className="mt-1 text-sm text-muted-foreground">Tout detay yo ap parèt pou vwazen yo.</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-border" aria-label="Fèmen fòm plat la" data-testid="button-close-meal-editor"><X size={17} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{field("name", "Non plat la", "Griyo & bannann")}{field("price", "Pri an goud", "650", "number")}{field("restaurantName", "Non restoran an", "Chez Tati")}{field("phoneNumber", "Telefòn restoran an", "37 00 00 00")}{field("deliveryArea", "Zòn livrezon", "Delmas, Pòtoprens")}{field("eta", "Tan livrezon", "25–35 min")}{field("rating", "Nòt", "4.8")}{field("photoUrl", "Lyen foto (si ou genyen)", "https://...")}</div><label className="mt-4 block text-xs font-bold">Kategori<select value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary" data-testid="select-meal-category">{categories.filter((item) => item.name !== "Tout").map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label><label className="mt-4 block text-xs font-bold">Deskripsyon<textarea required value={form.description} onChange={(e) => set("description", e.target.value)} className="mt-1.5 min-h-20 w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary" placeholder="Sa ki ladan l..." data-testid="input-meal-description" /></label><label className="mt-4 flex items-center gap-3 rounded-xl bg-[#eef3df] p-3 text-sm font-bold text-secondary"><input type="checkbox" checked={form.available} onChange={(e) => set("available", e.target.checked)} className="h-4 w-4 accent-[#e66d31]" data-testid="checkbox-meal-available" /> Plat la disponib pou kòmand</label><button type="submit" disabled={pending} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60" data-testid="button-save-meal">{pending && <Loader2 className="animate-spin" size={17} />}{pending ? "N ap sove..." : meal ? "Sove chanjman yo" : "Ajoute plat la"}</button></form></div>;
}

function statusLabel(status: Order["status"]) { return status === "pending" ? "Ap tann" : status === "accepted" ? "Aksepte" : "Refize"; }
function paymentLabel(payment: Order["paymentMethod"]) { return payment === "moncash" ? "MonCash" : payment === "natcash" ? "NatCash" : "Lajan kach"; }

function Merchant() {
  const client = useQueryClient();
  const mealsQuery = useListMeals({ includeUnavailable: true });
  const ordersQuery = useListOrders();
  const overviewQuery = useGetMerchantOverview();
  const updateStatus = useUpdateOrderStatus();
  const deleteMeal = useDeleteMeal();
  const [editor, setEditor] = useState<Meal | null | undefined>(undefined);
  const [notice, setNotice] = useState("");
  const meals = mealsQuery.data ?? fallbackMeals.map((item) => ({ id: item.id, name: item.name, description: item.description, category: item.category, price: item.price, photoUrl: item.image || null, available: item.available, restaurantName: item.place, phoneNumber: "37 00 00 00", deliveryArea: "Delmas, Pòtoprens", rating: item.rating, eta: item.eta, createdAt: "", updatedAt: "" } as Meal));
  const orders = ordersQuery.data ?? fallbackOrders;
  const overview = overviewQuery.data ?? fallbackOverview;
  const refresh = () => { void client.invalidateQueries({ queryKey: getListMealsQueryKey({ includeUnavailable: true }) }); void client.invalidateQueries({ queryKey: getListMealsQueryKey({ includeUnavailable: false }) }); void client.invalidateQueries({ queryKey: getListOrdersQueryKey() }); void client.invalidateQueries({ queryKey: getGetMerchantOverviewQueryKey() }); };
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3000); };
  const changeStatus = (order: Order, status: "accepted" | "rejected") => updateStatus.mutate({ id: order.id, data: { status } }, { onSuccess: () => { refresh(); flash(status === "accepted" ? "Kòmand lan aksepte." : "Kòmand lan refize."); }, onError: () => flash("Nou pa rive chanje estati kòmand lan.") });
  const remove = (meal: Meal) => { if (!window.confirm(`Èske ou vle retire ${meal.name} nan meni an?`)) return; deleteMeal.mutate({ id: meal.id }, { onSuccess: () => { refresh(); flash("Plat la retire nan meni an."); }, onError: () => flash("Nou pa rive retire plat la.") }); };
  return <div className="min-h-dvh bg-[#f7f3eb]"><header className="border-b border-[#e6ddcf] bg-[#fffaf3]"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Link href="/" className="flex items-center gap-2.5" data-testid="link-merchant-logo"><span className="grid h-10 w-10 rotate-[-4deg] place-items-center rounded-[13px] bg-primary text-primary-foreground shadow-[0_5px_0_#b84b1d]"><UtensilsCrossed size={21} /></span><span className="font-display text-[23px] text-secondary">Manje <span className="text-primary">Lakay</span></span></Link><div className="flex items-center gap-3"><span className="hidden text-xs font-bold uppercase tracking-[.13em] text-muted-foreground sm:inline">Espas patnè</span><Link href="/" className="flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-bold text-secondary" data-testid="link-back-home"><HomeIcon size={15} /> Retounen sou meni</Link></div></div></header><main className="mx-auto max-w-7xl px-5 py-7 lg:px-8 lg:py-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Bonjou, patnè</p><h1 className="mt-1 font-display text-4xl tracking-[-.03em] text-secondary sm:text-5xl">Jere kwizin ou.</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Kenbe meni an fre, epi reponn vwazen yo san pèdi tan.</p></div><button type="button" onClick={() => setEditor(null)} className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_20px_hsl(23_84%_53%_/_0.2)]" data-testid="button-add-meal"><Plus size={17} /> Ajoute yon plat</button></div>{(mealsQuery.isError || ordersQuery.isError || overviewQuery.isError) && <div className="mt-5 rounded-xl bg-[#fff1dc] px-4 py-3 text-xs text-[#805b12]" role="status" data-testid="status-merchant-fallback">Kèk done pa t ka chaje; n ap montre dènye enfòmasyon ki disponib.</div>}<section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Rezime aktivite"><SummaryCard label="Tout plat" value={overview.mealCount} detail={`${overview.availableMealCount} disponib`} icon={UtensilsCrossed} tone="orange" testId="summary-meals" /><SummaryCard label="Kòmand ap tann" value={overview.pendingOrderCount} detail="Bezwen repons ou" icon={Clock3} tone="yellow" testId="summary-pending" /><SummaryCard label="Kòmand aksepte" value={overview.acceptedOrderCount} detail="Pare pou kwizin" icon={PackageCheck} tone="green" testId="summary-accepted" /><SummaryCard label="Revni total" value={`${money(overview.totalRevenue)} G`} detail="Kòmand aksepte" icon={CircleDollarSign} tone="cream" testId="summary-revenue" /></section><div className="mt-9 grid gap-7 xl:grid-cols-[1.05fr_.95fr]"><section className="rounded-[1.6rem] border border-[#e6ddcf] bg-[#fffaf3] p-5 sm:p-6" data-testid="section-meal-catalog"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">Meni ou</p><h2 className="mt-1 font-display text-2xl text-secondary">Plat yo</h2></div><span className="rounded-full bg-[#eef3df] px-3 py-1.5 text-[11px] font-bold text-secondary">{meals.length} plat</span></div>{mealsQuery.isLoading && meals.length === 0 ? <div className="mt-5 space-y-3">{[1, 2, 3].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div> : meals.length ? <div className="mt-5 space-y-3">{meals.map((meal) => <MealRow key={meal.id} meal={meal} onEdit={() => setEditor(meal)} onDelete={() => remove(meal)} />)}</div> : <EmptyBox icon={ImagePlus} title="Meni an vid" text="Ajoute premye plat ou pou vwazen yo dekouvri l." action="Ajoute yon plat" onAction={() => setEditor(null)} testId="empty-meals" />}</section><section className="rounded-[1.6rem] border border-[#e6ddcf] bg-[#fffaf3] p-5 sm:p-6" data-testid="section-incoming-orders"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">Travay k ap antre</p><h2 className="mt-1 font-display text-2xl text-secondary">Kòmand resan yo</h2></div><span className="rounded-full bg-[#fff1dc] px-3 py-1.5 text-[11px] font-bold text-[#9a5d1c]">{orders.length} kòmand</span></div>{ordersQuery.isLoading && orders.length === 0 ? <div className="mt-5 space-y-3">{[1, 2].map((n) => <div key={n} className="h-36 animate-pulse rounded-xl bg-muted" />)}</div> : orders.length ? <div className="mt-5 space-y-3">{orders.map((order) => <OrderRow key={order.id} order={order} pending={updateStatus.isPending} onAccept={() => changeStatus(order, "accepted")} onReject={() => changeStatus(order, "rejected")} />)}</div> : <EmptyBox icon={Truck} title="Pa gen kòmand ankò" text="Lè yon vwazen pase kòmand, l ap parèt isit la." testId="empty-orders" />}</section></div></main>{editor !== undefined && <MealEditor meal={editor} onClose={() => setEditor(undefined)} onSaved={(message) => { setEditor(undefined); refresh(); flash(message); }} />}{notice && <div className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-secondary px-5 py-3 text-xs font-bold text-secondary-foreground shadow-xl" role="status" data-testid="status-merchant-notice">{notice}</div>}</div>;
}

function SummaryCard({ label, value, detail, icon: Icon, tone, testId }: { label: string; value: string | number; detail: string; icon: typeof Store; tone: string; testId: string }) {
  const colors: Record<string, string> = { orange: "bg-[#fff0df] text-primary", yellow: "bg-[#fff4c9] text-[#9b7217]", green: "bg-[#e7f0d6] text-secondary", cream: "bg-[#f5e7c6] text-[#8c6a2b]" };
  return <div className="rounded-2xl border border-[#e6ddcf] bg-[#fffaf3] p-4" data-testid={testId}><div className="flex items-start justify-between"><span className={`grid h-9 w-9 place-items-center rounded-xl ${colors[tone]}`}><Icon size={17} /></span><span className="text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">Jodi a</span></div><p className="mt-4 text-2xl font-bold text-secondary" data-testid={`${testId}-value`}>{value}</p><p className="mt-0.5 text-xs font-bold">{label}</p><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div>;
}
function MealRow({ meal, onEdit, onDelete }: { meal: Meal; onEdit: () => void; onDelete: () => void }) {
  return <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3" data-testid={`row-meal-${meal.id}`}><div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ${tones[meal.id % tones.length]}`}><FoodArtwork item={toFoodItem(meal)} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-bold text-secondary" data-testid={`text-meal-name-${meal.id}`}>{meal.name}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${meal.available ? "bg-[#e7f0d6] text-secondary" : "bg-muted text-muted-foreground"}`} data-testid={`status-meal-${meal.id}`}>{meal.available ? "Disponib" : "Epwize"}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{meal.restaurantName} · {meal.category}</p><p className="mt-1 text-xs font-bold text-primary">{money(meal.price)} G</p></div><div className="flex gap-1"><button type="button" onClick={onEdit} className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary" aria-label={`Modifye ${meal.name}`} data-testid={`button-edit-meal-${meal.id}`}><Pencil size={14} /></button><button type="button" onClick={onDelete} className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground hover:border-destructive hover:text-destructive" aria-label={`Retire ${meal.name}`} data-testid={`button-delete-meal-${meal.id}`}><Trash2 size={14} /></button></div></div>;
}
function OrderRow({ order, pending, onAccept, onReject }: { order: Order; pending: boolean; onAccept: () => void; onReject: () => void }) {
  return <article className="rounded-xl border border-border/80 bg-card p-4" data-testid={`row-order-${order.id}`}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><p className="text-sm font-bold text-secondary" data-testid={`text-customer-${order.id}`}>{order.customerName}</p><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${order.status === "pending" ? "bg-[#fff4c9] text-[#8d6c1e]" : order.status === "accepted" ? "bg-[#e7f0d6] text-secondary" : "bg-[#f9e1da] text-destructive"}`} data-testid={`status-order-${order.id}`}>{statusLabel(order.status)}</span></div><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Phone size={12} /> {order.customerPhone} <span>·</span> {paymentLabel(order.paymentMethod)}</p></div><p className="text-sm font-bold text-primary">{money(order.total)} G</p></div><div className="mt-3 rounded-lg bg-[#f7f3eb] px-3 py-2 text-xs text-muted-foreground"><p className="font-semibold text-foreground">{order.items.map((item) => `${item.quantity}× ${item.mealName}`).join(", ")}</p><p className="mt-1">{order.deliveryAddress}</p></div>{order.status === "pending" && <div className="mt-3 flex gap-2"><button type="button" onClick={onAccept} disabled={pending} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary py-2.5 text-xs font-bold text-secondary-foreground disabled:opacity-50" data-testid={`button-accept-order-${order.id}`}><Check size={14} /> Aksepte</button><button type="button" onClick={onReject} disabled={pending} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#e9b7aa] py-2.5 text-xs font-bold text-destructive disabled:opacity-50" data-testid={`button-reject-order-${order.id}`}><XCircle size={14} /> Refize</button></div>}</article>;
}
function EmptyBox({ icon: Icon, title, text, action, onAction, testId }: { icon: typeof Store; title: string; text: string; action?: string; onAction?: () => void; testId: string }) {
  return <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center" data-testid={testId}><Icon className="mx-auto text-muted-foreground" size={28} /><h3 className="mt-3 font-display text-xl text-secondary">{title}</h3><p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{text}</p>{action && onAction && <button type="button" onClick={onAction} className="mt-4 rounded-full bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground" data-testid={`${testId}-action`}>{action}</button>}</div>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/merchant" component={Merchant} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;