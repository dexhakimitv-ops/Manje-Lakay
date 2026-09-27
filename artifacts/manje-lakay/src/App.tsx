import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Clock3,
  Compass,
  Heart,
  Home as HomeIcon,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Trash2,
  X,
  UtensilsCrossed,
} from 'lucide-react';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

type Category = 'Tout' | 'Plat peyi' | 'Ti dejene' | 'Diri & sòs' | 'Bwason';

type FoodItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Exclude<Category, 'Tout'>;
  place: string;
  eta: string;
  rating: string;
  image: string;
  tone: string;
  popular?: boolean;
};

type CartLine = FoodItem & { quantity: number };

const queryClient = new QueryClient();

const categories: { name: Category; icon: typeof UtensilsCrossed }[] = [
  { name: 'Tout', icon: Sparkles },
  { name: 'Plat peyi', icon: UtensilsCrossed },
  { name: 'Ti dejene', icon: Store },
  { name: 'Diri & sòs', icon: PackageCheck },
  { name: 'Bwason', icon: Heart },
];

const foodItems: FoodItem[] = [
  {
    id: 'soup-joumou',
    name: 'Soup joumou',
    description: 'Vyann bèf, legim, makawoni',
    price: 475,
    category: 'Plat peyi',
    place: 'Lakou Manje',
    eta: '25–35 min',
    rating: '4.9',
    image: '/soup-joumou.jpg',
    tone: 'bg-[#e4a353]',
    popular: true,
  },
  {
    id: 'griot-banann',
    name: 'Griyo & bannann',
    description: 'Chou pikliz, sòs ti piman',
    price: 650,
    category: 'Plat peyi',
    place: 'Chez Tati',
    eta: '30–40 min',
    rating: '4.8',
    image: '',
    tone: 'bg-[#ca7040]',
    popular: true,
  },
  {
    id: 'akra',
    name: 'Akra lakay',
    description: '6 moso, sòs mayi',
    price: 250,
    category: 'Ti dejene',
    place: 'Mango Café',
    eta: '15–25 min',
    rating: '4.7',
    image: '',
    tone: 'bg-[#d6a43f]',
  },
  {
    id: 'diri-djon-djon',
    name: 'Diri djondjon',
    description: 'Pwa nwa, poul boukannen',
    price: 575,
    category: 'Diri & sòs',
    place: 'Kreyòl Kitchen',
    eta: '25–35 min',
    rating: '4.9',
    image: '',
    tone: 'bg-[#5f7952]',
    popular: true,
  },
  {
    id: 'banann-peze',
    name: 'Banann peze',
    description: 'Poul fri, pikliz fre',
    price: 390,
    category: 'Plat peyi',
    place: 'Lakou Manje',
    eta: '25–35 min',
    rating: '4.6',
    image: '',
    tone: 'bg-[#c8a84f]',
  },
  {
    id: 'jus-chadek',
    name: 'Jis chadèk',
    description: 'Frèch, san twòp sik',
    price: 180,
    category: 'Bwason',
    place: 'Mango Café',
    eta: '15–20 min',
    rating: '4.8',
    image: '',
    tone: 'bg-[#91a65e]',
  },
];

const money = (amount: number) =>
  new Intl.NumberFormat('fr-FR').format(amount).replace(/\u202f/g, ' ');

function FoodArtwork({ item }: { item: FoodItem }) {
  if (item.image) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${item.image})` }}
        aria-label={`Foto ${item.name}`}
      />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${item.tone}`}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full border-[14px] border-white/15" />
      <div className="absolute -bottom-8 left-3 h-24 w-24 rounded-full bg-black/10" />
      <div className="absolute left-1/2 top-1/2 h-20 w-28 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] rounded-[46%] bg-[#f2d49c]/85 shadow-[0_12px_18px_rgba(55,31,11,.18)]" />
      <div className="absolute left-[42%] top-[40%] h-2 w-2 rounded-full bg-[#7b4d2a]/60 shadow-[18px_7px_#7b4d2a66,-12px_13px_#7b4d2a66,8px_-10px_#7b4d2a66]" />
    </div>
  );
}

function FoodCard({
  item,
  onAdd,
}: {
  item: FoodItem;
  onAdd: (item: FoodItem) => void;
}) {
  return (
    <article
      className="group overflow-hidden rounded-[1.35rem] border border-[#e9dfd0] bg-card shadow-[0_5px_18px_hsl(147_31%_15%_/_0.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_32px_hsl(147_31%_15%_/_0.11)]"
      data-testid={`card-food-${item.id}`}
    >
      <div className="relative h-40 overflow-hidden">
        <FoodArtwork item={item} />
        {item.popular && (
          <span
            className="absolute left-3 top-3 rounded-full bg-[#fff5cf]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#805b12]"
            data-testid={`badge-popular-${item.id}`}
          >
            Pi renmen
          </span>
        )}
        <button
          type="button"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#fffaf2]/85 text-[#6b5948] backdrop-blur transition hover:bg-[#fffaf2] hover:text-primary"
          aria-label={`Ajoute ${item.name} nan pi renmen`}
          data-testid={`button-favorite-${item.id}`}
        >
          <Heart size={15} strokeWidth={2.2} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg leading-tight text-foreground">{item.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-primary" data-testid={`text-price-${item.id}`}>
              {money(item.price)} G
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Star size={12} className="fill-[#e5a52b] text-[#e5a52b]" /> {item.rating}</span>
            <span className="text-border">·</span>
            <span>{item.eta}</span>
          </div>
          <button
            type="button"
            onClick={() => onAdd(item)}
            className="flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3.5 text-xs font-bold text-secondary-foreground transition hover:scale-[1.03] hover:bg-[#245d3e] active:scale-95"
            data-testid={`button-add-${item.id}`}
          >
            <Plus size={15} strokeWidth={2.5} /> Ajoute
          </button>
        </div>
      </div>
    </article>
  );
}

function CartPanel({
  cart,
  open,
  onClose,
  onChange,
  onCheckout,
}: {
  cart: CartLine[];
  open: boolean;
  onClose: () => void;
  onChange: (id: string, delta: number) => void;
  onCheckout: () => void;
}) {
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const service = cart.length ? 45 : 0;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fèmen panyen an"
          className="fixed inset-0 z-40 cursor-default bg-[#173425]/25 backdrop-blur-[2px]"
          onClick={onClose}
          data-testid="button-close-cart-backdrop"
        />
      )}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-dvh w-full max-w-[420px] flex-col bg-[#fffaf3] shadow-[-15px_0_45px_rgba(33,50,35,.14)] transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Panyen an"
        data-testid="panel-cart"
      >
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Manje Lakay</p>
            <h2 className="font-display text-2xl">Panyen ou</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Fèmen panyen an"
            data-testid="button-close-cart"
          >
            <X size={18} />
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[#f6e6c8] text-primary">
              <ShoppingBag size={30} strokeWidth={1.7} />
            </div>
            <h3 className="mt-5 font-display text-2xl">Panyen an vid</h3>
            <p className="mt-2 max-w-[240px] text-sm leading-6 text-muted-foreground">Chwazi yon bon plat pou kòmanse kòmand ou.</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="button-browse-menu">
              Gade meni an
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <div className="mb-5 rounded-xl bg-[#eef3df] px-3.5 py-3 text-xs leading-5 text-secondary">
                Kòmand ou ap soti nan <strong>Delmas, Pòtoprens</strong>
              </div>
              {cart.map((line) => (
                <div key={line.id} className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-3" data-testid={`cart-line-${line.id}`}>
                  <div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ${line.tone}`}><FoodArtwork item={line} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{line.name}</p>
                    <p className="mt-0.5 text-xs text-primary">{money(line.price)} G</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                    <button type="button" onClick={() => onChange(line.id, -1)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-card" aria-label={`Retire yon ${line.name}`} data-testid={`button-decrease-${line.id}`}><Minus size={13} /></button>
                    <span className="w-5 text-center text-xs font-bold" data-testid={`text-quantity-${line.id}`}>{line.quantity}</span>
                    <button type="button" onClick={() => onChange(line.id, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-card text-secondary shadow-sm hover:bg-white" aria-label={`Ajoute yon ${line.name}`} data-testid={`button-increase-${line.id}`}><Plus size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border/80 bg-card p-5 safe-bottom">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span data-testid="text-cart-subtotal">{money(subtotal)} G</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Frè sèvis</span><span>{money(service)} G</span></div>
                <div className="mt-3 flex justify-between border-t border-border/70 pt-3 text-base font-bold"><span>Total</span><span className="text-primary" data-testid="text-cart-total">{money(subtotal + service)} G</span></div>
              </div>
              <button type="button" onClick={onCheckout} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-[0_8px_18px_hsl(23_84%_53%_/_0.25)] transition hover:-translate-y-0.5 hover:brightness-105" data-testid="button-checkout">
                Pase kòmand lan <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function Home() {
  const [category, setCategory] = useState<Category>('Tout');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showInstall, setShowInstall] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return foodItems.filter((item) => {
      const categoryMatch = category === 'Tout' || item.category === category;
      const searchMatch = !query || `${item.name} ${item.description} ${item.place}`.toLowerCase().includes(query);
      return categoryMatch && searchMatch;
    });
  }, [category, search]);

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const addToCart = (item: FoodItem) => {
    setCart((current) => {
      const found = current.find((line) => line.id === item.id);
      return found
        ? current.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { ...item, quantity: 1 }];
    });
    setNotice(`${item.name} ajoute nan panyen ou`);
  };

  const changeCart = (id: string, delta: number) => {
    setCart((current) => current.map((line) => line.id === id ? { ...line, quantity: line.quantity + delta } : line).filter((line) => line.quantity > 0));
  };

  return (
    <div className="noise-overlay min-h-dvh bg-background pb-24">
      <header className="relative z-20 border-b border-[#e9dfd0]/70 bg-[#fffaf3]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <button type="button" className="flex items-center gap-2.5" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-testid="button-logo-home">
            <span className="grid h-10 w-10 rotate-[-4deg] place-items-center rounded-[13px] bg-primary text-primary-foreground shadow-[0_5px_0_#b84b1d]"><UtensilsCrossed size={21} strokeWidth={2.5} /></span>
            <span className="font-display text-[23px] tracking-[-.03em] text-secondary">Manje <span className="text-primary">Lakay</span></span>
          </button>
          <div className="hidden items-center gap-7 md:flex">
            <button type="button" onClick={() => document.getElementById('meni')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-semibold text-muted-foreground transition hover:text-foreground" data-testid="button-nav-menu">Meni an</button>
            <button type="button" onClick={() => setNotice('N ap chèche restoran ki pi pre ou yo')} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground" data-testid="button-location"><Compass size={16} /> Delmas, Pòtoprens <ChevronDown size={14} /></button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Notifikasyon" className="hidden h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:bg-muted md:grid" data-testid="button-notifications"><Bell size={18} /></button>
            <button type="button" onClick={() => setCartOpen(true)} className="relative flex h-10 items-center gap-2 rounded-full bg-secondary px-3.5 text-sm font-bold text-secondary-foreground transition hover:bg-[#245d3e]" data-testid="button-open-cart">
              <ShoppingBag size={17} /><span className="hidden sm:inline">Panyen</span>
              {itemCount > 0 && <span className="animate-pop absolute -right-1 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground" data-testid="badge-cart-count">{itemCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pt-8 lg:px-8 lg:pt-14">
          <div className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-8 text-secondary-foreground sm:px-10 sm:py-12 lg:min-h-[330px] lg:px-14">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-[#c9d782]/15" />
            <div className="absolute bottom-[-80px] right-[28%] h-48 w-48 rounded-full bg-primary/20" />
            <div className="relative z-10 max-w-[600px] animate-rise-in">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#d6e49e]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#dce9ac]"><span className="h-1.5 w-1.5 rounded-full bg-[#f4c94f]" /> Bonjou, vwazen</div>
              <h1 className="font-display text-[2.8rem] leading-[.98] tracking-[-.045em] sm:text-6xl">Bon manje pa janm lwen.</h1>
              <p className="mt-4 max-w-[440px] text-sm leading-6 text-[#d4e0c6] sm:text-base">Jwenn plat ou renmen yo, prepare ak kè pa moun nan katye w la.</p>
              <div className="mt-7 flex max-w-[500px] items-center gap-2 rounded-2xl bg-[#fdf7ed] p-1.5 shadow-lg">
                <Search size={19} className="ml-3 shrink-0 text-[#839079]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Kisa ou ta renmen manje?" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-foreground outline-none placeholder:text-[#9a9b88]" data-testid="input-search-food" />
                <button type="button" onClick={() => document.getElementById('meni')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground transition hover:brightness-105 sm:px-5" data-testid="button-search-food">Chèche</button>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-[-15px] hidden h-[280px] w-[285px] rounded-tl-[55%] bg-[#e7a858] opacity-90 lg:block">
              <div className="absolute left-[-40px] top-[55px] h-[160px] w-[260px] rotate-[-11deg] rounded-[45%] border-[18px] border-[#f6d9a0]/70 bg-[#c87943] shadow-[-14px_18px_0_#b6633a]" />
              <div className="absolute left-[46px] top-[90px] h-5 w-5 rounded-full bg-[#6c3f26] shadow-[50px_-22px_0_#6c3f26,96px_4px_0_#6c3f26,30px_36px_0_#6c3f26]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pt-8 lg:px-8" aria-label="Kategori manje">
          <div className="flex items-end justify-between">
            <div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">Chwazi sa w anvi</p><h2 className="mt-1 font-display text-2xl sm:text-3xl">Kisa k ap fè w plezi?</h2></div>
            <span className="hidden text-xs text-muted-foreground sm:block">Bon jan gou, bò kote w</span>
          </div>
          <div className="-mx-5 mt-5 flex gap-2.5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
            {categories.map(({ name, icon: Icon }) => (
              <button type="button" key={name} onClick={() => setCategory(name)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition-all ${category === name ? 'border-primary bg-primary text-primary-foreground shadow-[0_5px_12px_hsl(23_84%_53%_/_0.2)]' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'}`} data-testid={`button-category-${name.toLowerCase().replaceAll(' ', '-')}`}>
                <Icon size={15} /> {name}
              </button>
            ))}
          </div>
        </section>

        <section id="meni" className="mx-auto max-w-6xl px-5 pb-7 pt-8 lg:px-8">
          <div className="flex items-end justify-between">
            <div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-primary">Jodi a nan katye a</p><h2 className="mt-1 font-display text-2xl sm:text-3xl">Plat ki fè pale</h2></div>
            <button type="button" onClick={() => { setCategory('Tout'); setSearch(''); }} className="flex items-center gap-1 text-xs font-bold text-secondary transition hover:text-primary" data-testid="button-see-all">Wè tout <ArrowRight size={14} /></button>
          </div>
          {filteredItems.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item, index) => <div key={item.id} className="animate-rise-in" style={{ animationDelay: `${index * 70}ms` }}><FoodCard item={item} onAdd={addToCart} /></div>)}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center" data-testid="empty-search-state">
              <Search className="mx-auto text-muted-foreground" size={26} />
              <h3 className="mt-3 font-display text-xl">Pa gen plat sa a pou kounye a</h3>
              <p className="mt-1 text-sm text-muted-foreground">Eseye yon lòt mo oswa gade tout meni an.</p>
              <button type="button" onClick={() => { setCategory('Tout'); setSearch(''); }} className="mt-5 rounded-full bg-secondary px-5 py-2.5 text-xs font-bold text-secondary-foreground" data-testid="button-reset-search">Wè tout plat yo</button>
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-10 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-[#f3dfac] px-6 py-7 sm:px-9">
            <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full border-[20px] border-[#e3af47]/30" />
            <div className="relative z-10 max-w-[540px]">
              <div className="flex items-center gap-2 text-primary"><Smartphone size={17} /><span className="text-[11px] font-bold uppercase tracking-[.14em]">Toujou avèk ou</span></div>
              <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">Kòmande pi vit depi ekran ou.</h2>
              <p className="mt-2 max-w-[450px] text-sm leading-6 text-[#665338]">Enstale Manje Lakay sou telefòn ou pou jwenn bon manje ak yon sèl ti manyen.</p>
              <button type="button" onClick={() => setNotice('Manje Lakay pare pou enstale sou telefòn ou')} className="mt-5 rounded-full bg-secondary px-5 py-3 text-xs font-bold text-secondary-foreground transition hover:-translate-y-0.5" data-testid="button-install-app">Enstale aplikasyon an</button>
            </div>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-[#fffaf3]/95 px-5 py-2.5 backdrop-blur-lg md:hidden safe-bottom" aria-label="Navigasyon prensipal">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-primary" data-testid="button-bottom-home"><HomeIcon size={19} /><span className="text-[10px] font-bold">Akèy</span></button>
          <button type="button" onClick={() => document.getElementById('meni')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-muted-foreground" data-testid="button-bottom-explore"><Compass size={19} /><span className="text-[10px] font-bold">Eksplore</span></button>
          <button type="button" onClick={() => setCartOpen(true)} className="relative flex flex-col items-center gap-1 text-muted-foreground" data-testid="button-bottom-cart"><ShoppingBag size={19} /><span className="text-[10px] font-bold">Panyen</span>{itemCount > 0 && <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">{itemCount}</span>}</button>
        </div>
      </nav>

      {showInstall && (
        <div className="fixed bottom-[76px] left-4 right-4 z-30 mx-auto max-w-sm animate-rise-in rounded-2xl border border-[#e5cf99] bg-[#fff7df] p-3.5 shadow-[0_14px_35px_rgba(84,60,22,.16)] md:bottom-5 md:left-auto md:right-6" data-testid="banner-install">
          <button type="button" onClick={() => setShowInstall(false)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-[#8d7444] hover:bg-[#f4e6c2]" aria-label="Fèmen mesaj enstalasyon" data-testid="button-dismiss-install"><X size={14} /></button>
          <div className="flex gap-3 pr-5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Smartphone size={17} /></div><div><p className="text-xs font-bold text-[#604917]">Mete Manje Lakay nan telefòn ou</p><p className="mt-0.5 text-[11px] leading-4 text-[#8d7444]">Li pare menm lè koneksyon an pa twò fò.</p></div></div>
        </div>
      )}
      {notice && <div className="fixed left-1/2 top-5 z-[60] -translate-x-1/2 animate-pop rounded-full bg-secondary px-4 py-2.5 text-xs font-bold text-secondary-foreground shadow-lg" role="status" data-testid="status-notice">{notice}</div>}
      {cart.length > 0 && !cartOpen && <button type="button" onClick={() => setCartOpen(true)} className="fixed bottom-[82px] right-5 z-20 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-[0_10px_24px_hsl(23_84%_53%_/_0.3)] transition hover:-translate-y-1 md:bottom-6" data-testid="button-floating-cart"><ShoppingBag size={16} /> {itemCount} atik <span className="ml-1 border-l border-white/30 pl-2">{money(total)} G</span></button>}
      <CartPanel cart={cart} open={cartOpen} onClose={() => setCartOpen(false)} onChange={changeCart} onCheckout={() => setNotice('Kòmand lan pare. N ap ajoute livrezon talè!')} />
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;