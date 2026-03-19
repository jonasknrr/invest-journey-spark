import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiLock, FiCheckCircle, FiAward, FiRefreshCw, FiX } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getStocksForGame, type StockSummary } from '@/services/marketData';

const START_YEAR = 2010;
const END_YEAR = 2020;
const BUDGET = 5000;
const TARGET_PCT = 50;

type Phase = 'picking' | 'reveal' | 'result';

const StockPickerPage = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [market, setMarket] = useState<'smi' | 'djia'>('smi');
  const [smiStocks, setSmiStocks] = useState<StockSummary[]>([]);
  const [djiaStocks, setDjiaStocks] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockSummary | null>(null);
  const [modalStock, setModalStock] = useState<StockSummary | null>(null);
  const [phase, setPhase] = useState<Phase>('picking');

  const stocks = market === 'smi' ? smiStocks : djiaStocks;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getStocksForGame('smi', START_YEAR, END_YEAR),
      getStocksForGame('djia', START_YEAR, END_YEAR),
    ]).then(([smi, djia]) => {
      setSmiStocks(smi);
      setDjiaStocks(djia);
      setLoading(false);
    });
  }, []);

  const handleSelect = (stock: StockSummary) => {
    setSelectedStock(stock);
    setModalStock(null);
    setPhase('reveal');
  };

  const endValue = selectedStock
    ? Math.round(BUDGET * (1 + selectedStock.returnPct / 100))
    : 0;
  const goalMet = selectedStock ? selectedStock.returnPct >= TARGET_PCT : false;

  const getChartData = (stock: StockSummary) => {
    const step = Math.max(1, Math.floor(stock.prices.length / 60));
    const sampled = stock.prices.filter((_, i) => i % step === 0 || i === stock.prices.length - 1);
    const startDate = new Date(sampled[0].date).getTime();
    const totalMs = new Date(sampled[sampled.length - 1].date).getTime() - startDate;
    return sampled.map((p) => {
      const elapsed = new Date(p.date).getTime() - startDate;
      const year = (elapsed / totalMs) * (END_YEAR - START_YEAR);
      return { year: `Year ${Math.round(year)}`, price: p.price };
    });
  };

  /* ── Reveal phase ── */
  if (phase === 'reveal' && selectedStock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <motion.p
            className="text-6xl mb-6"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            📅
          </motion.p>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            The time period was:
          </h2>
          <motion.p
            className="font-display text-4xl font-bold text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {START_YEAR} – {END_YEAR}
          </motion.p>
          <motion.button
            className="mt-8 h-14 px-10 rounded-full bg-primary text-primary-foreground font-display text-base font-bold shadow-sm"
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => setPhase('result')}
          >
            Show result →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ── Result phase ── */
  if (phase === 'result' && selectedStock) {
    return (
      <div className="min-h-screen bg-background px-5 pt-10 pb-10">
        <motion.div
          className="max-w-md mx-auto space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className="text-center text-6xl"
            animate={goalMet ? { scale: [1, 1.3, 1] } : { x: [0, -8, 8, -8, 0] }}
            transition={{ duration: 0.6 }}
          >
            {goalMet ? '🎉' : '😬'}
          </motion.p>

          <h1 className={`font-display text-2xl font-bold text-center ${goalMet ? 'text-primary' : 'text-destructive'}`}>
            {goalMet ? 'Goal reached!' : 'Close, but not quite!'}
          </h1>

          <div className={`rounded-3xl p-5 border shadow-card ${
            goalMet ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                goalMet ? 'bg-primary/15' : 'bg-destructive/15'
              }`}>
                <FiAward size={24} className={goalMet ? 'text-primary' : 'text-destructive'} />
              </div>
              <div>
                <p className="font-display font-bold text-foreground">{selectedStock.name}</p>
                <p className="text-xs text-muted-foreground font-body">{selectedStock.ticker}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-card rounded-2xl p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Invested</p>
                <p className="font-display text-lg font-bold text-foreground tabular-nums">
                  {BUDGET.toLocaleString('de-CH')} CHF
                </p>
              </div>
              <div className="bg-card rounded-2xl p-3 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Final value</p>
                <p className={`font-display text-lg font-bold tabular-nums ${goalMet ? 'text-primary' : 'text-destructive'}`}>
                  {endValue.toLocaleString('de-CH')} CHF
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Return</p>
              <p className={`font-display text-2xl font-bold tabular-nums ${goalMet ? 'text-primary' : 'text-destructive'}`}>
                {selectedStock.returnPct >= 0 ? '+' : ''}{selectedStock.returnPct.toFixed(1)}%
              </p>
            </div>
          </div>

          <p className="font-body text-sm text-muted-foreground text-center leading-relaxed">
            {goalMet
              ? `Your ${selectedStock.name} achieved a ${selectedStock.returnPct.toFixed(1)}% return — CHF ${BUDGET.toLocaleString('de-CH')} grew to CHF ${endValue.toLocaleString('de-CH')}!`
              : `${selectedStock.name} only achieved ${selectedStock.returnPct.toFixed(1)}%. You needed +${TARGET_PCT}% — try a different stock!`
            }
          </p>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (goalMet) {
                navigate(`/category/aktien`);
              } else {
                setPhase('picking');
                setSelectedStock(null);
              }
            }}
            className={`w-full h-14 rounded-full font-display text-base font-bold shadow-sm flex items-center justify-center gap-2 ${
              goalMet
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground'
            }`}
          >
            {goalMet ? (
              <>
                <FiCheckCircle size={20} />
                Continue
              </>
            ) : (
              <>
                <FiRefreshCw size={20} />
                Try again
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ── Picking phase ── */
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={() => navigate(`/challenge/${levelId}`, { state: { fromSubPage: true } })}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4"
        >
          <FiArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="font-display text-2xl font-bold text-foreground">Pick a stock</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Tap a stock to see its price history
        </p>
      </div>

      <div className="px-5 mb-5">
        <div className="flex gap-2">
          {(['smi', 'djia'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`flex-1 h-11 rounded-2xl font-display text-sm font-bold transition-colors ${
                market === m
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {m === 'smi' ? 'SMI 🇨🇭' : 'DJIA 🇺🇸'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="w-10 h-10 border-3 border-muted border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          />
        </div>
      )}

      {!loading && (
        <div className="px-5 space-y-3">
          {stocks.map((stock) => (
            <motion.div
              key={stock.ticker}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalStock(stock)}
              className="rounded-3xl bg-card border border-border shadow-card p-4 cursor-pointer active:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-foreground text-[15px]">{stock.name}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{stock.ticker}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
                  <FiLock size={12} className="text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-body">Return hidden</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalStock && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setModalStock(null)} />

            <motion.div
              className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-xl max-h-[90vh] overflow-y-auto"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <button
                onClick={() => setModalStock(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <FiX size={16} className="text-muted-foreground" />
              </button>

              <h2 className="font-display text-xl font-bold text-foreground mb-1">{modalStock.name}</h2>
              <p className="text-xs text-muted-foreground font-body mb-5">{modalStock.ticker}</p>

              <div className="h-48 mb-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getChartData(modalStock)}>
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                      domain={['dataMin', 'dataMax']}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(val: number) => [`CHF ${val.toFixed(2)}`, 'Price']}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--level-aktien))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-muted/50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Start price</p>
                  <p className="font-display text-sm font-bold text-foreground tabular-nums">
                    {modalStock.firstPrice.toFixed(2)}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">Low</p>
                  <p className="font-display text-sm font-bold text-foreground tabular-nums">
                    {modalStock.minPrice.toFixed(2)}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-2xl p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body font-semibold mb-1">High</p>
                  <p className="font-display text-sm font-bold text-foreground tabular-nums">
                    {modalStock.maxPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelect(modalStock)}
                  className="w-full h-14 rounded-full bg-primary text-primary-foreground font-display text-base font-bold shadow-sm"
                >
                  Pick this stock
                </motion.button>
                <button
                  onClick={() => setModalStock(null)}
                  className="w-full h-12 rounded-full border border-border text-foreground font-display text-sm font-bold"
                >
                  Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockPickerPage;
