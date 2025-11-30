import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MdTrendingUp,
  MdRefresh,
  MdArrowUpward,
  MdArrowDownward,
  MdSchedule,
} from "react-icons/md";
import { showToast } from "../components/CustomToast";
import LoadingSpinner from "../components/LoadingSpinner";

// Types for live rates
interface LiveMetalRate {
  metal: string;
  price: number;
  purity: string;
  unit: string;
  timestamp: number;
  change: number;
  changePercent: number;
  previousPrice: number;
}

export default function Rates() {
  const [liveRates, setLiveRates] = useState<LiveMetalRate[]>([]);
  const [loadingLiveRates, setLoadingLiveRates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const previousRatesRef = useRef<LiveMetalRate[]>([]);

  const METAL_PRICE_API_KEY = "da6b6cedefa5fee3e3a303d8040e86cd";

  // Real-time price fluctuation simulation
  const simulatePriceFluctuation = (
    basePrice: number,
    volatility: number = 0.001
  ) => {
    // Small random fluctuation (±0.1% typically)
    const fluctuation = (Math.random() - 0.5) * 2 * volatility;
    return basePrice * (1 + fluctuation);
  };

  // Fetch initial rates from API
  const fetchInitialRates = async () => {
    try {
      setLoadingLiveRates(true);

      const response = await fetch(
        `https://api.metalpriceapi.com/v1/latest?api_key=${METAL_PRICE_API_KEY}&base=USD&currencies=XAU,XAG`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch live rates");
      }

      const data = await response.json();

      const initialRates: LiveMetalRate[] = [
        {
          metal: "gold",
          price: convertGoldPrice(data.rates.XAU),
          purity: "24K",
          unit: "gram",
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          previousPrice: convertGoldPrice(data.rates.XAU),
        },
        {
          metal: "silver",
          price: convertSilverPrice(data.rates.XAG),
          purity: "999",
          unit: "gram",
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          previousPrice: convertSilverPrice(data.rates.XAG),
        },
        {
          metal: "rose gold",
          price: convertGoldPrice(data.rates.XAU) * 0.75,
          purity: "18K",
          unit: "gram",
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          previousPrice: convertGoldPrice(data.rates.XAU) * 0.75,
        },
        {
          metal: "sterling silver",
          price: convertSilverPrice(data.rates.XAG) * 0.925,
          purity: "925",
          unit: "gram",
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          previousPrice: convertSilverPrice(data.rates.XAG) * 0.925,
        },
      ];

      setLiveRates(initialRates);
      previousRatesRef.current = initialRates;
      setLastUpdated(new Date());
      showToast.success("Live rates connected successfully!");
    } catch (error) {
      console.error("Error fetching live rates:", error);
      showToast.error("Failed to fetch live rates. Using simulated data.");

      // Fallback with simulated base prices
      const fallbackRates: LiveMetalRate[] = [
        {
          metal: "gold",
          price: 6250.5,
          purity: "24K",
          unit: "gram",
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          previousPrice: 6250.5,
        },
        {
          metal: "silver",
          price: 78.3,
          purity: "999",
          unit: "gram",
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          previousPrice: 78.3,
        },
        {
          metal: "rose gold",
          price: 4687.88,
          purity: "18K",
          unit: "gram",
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          previousPrice: 4687.88,
        },
        {
          metal: "sterling silver",
          price: 72.43,
          purity: "925",
          unit: "gram",
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          previousPrice: 72.43,
        },
      ];
      setLiveRates(fallbackRates);
      previousRatesRef.current = fallbackRates;
    } finally {
      setLoadingLiveRates(false);
    }
  };

  // Update rates every second with realistic fluctuations
  const updateRatesInRealTime = () => {
    setLiveRates((prevRates) => {
      const updatedRates = prevRates.map((rate) => {
        // Different volatility for different metals
        const volatility = rate.metal.includes("gold") ? 0.0005 : 0.001;

        const newPrice = simulatePriceFluctuation(
          rate.previousPrice,
          volatility
        );
        const change = newPrice - rate.previousPrice;
        const changePercent = (change / rate.previousPrice) * 100;

        return {
          ...rate,
          price: newPrice,
          change: change,
          changePercent: changePercent,
          timestamp: Date.now(),
        };
      });

      return updatedRates;
    });

    setLastUpdated(new Date());
    setUpdateCount((prev) => prev + 1);
  };

  // Convert gold price from USD per troy ounce to INR per gram
  const convertGoldPrice = (usdPerTroyOunce: number): number => {
    const usdToInr = 83;
    const gramsPerTroyOunce = 31.1035;
    return (usdPerTroyOunce * usdToInr) / gramsPerTroyOunce;
  };

  // Convert silver price from USD per troy ounce to INR per gram
  const convertSilverPrice = (usdPerTroyOunce: number): number => {
    const usdToInr = 83;
    const gramsPerTroyOunce = 31.1035;
    return (usdPerTroyOunce * usdToInr) / gramsPerTroyOunce;
  };

  // Reset to initial API prices
  const refreshBasePrices = async () => {
    await fetchInitialRates();
    showToast.success("Base prices refreshed from market!");
  };

  // Initialize and start real-time updates
  useEffect(() => {
    fetchInitialRates();
  }, []);

  // Real-time update effect
  useEffect(() => {
    const interval = setInterval(updateRatesInRealTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const getMetalColor = (metalType: string) => {
    const colors = {
      gold: "text-yellow-600",
      silver: "text-gray-600",
      "rose gold": "text-rose-600",
      "sterling silver": "text-blue-600",
    };
    return colors[metalType as keyof typeof colors] || "text-gray-600";
  };

  const getMetalBgColor = (metalType: string) => {
    const colors = {
      gold: "bg-yellow-50 border-yellow-200",
      silver: "bg-gray-50 border-gray-200",
      "rose gold": "bg-rose-50 border-rose-200",
      "sterling silver": "bg-blue-50 border-blue-200",
    };
    return (
      colors[metalType as keyof typeof colors] || "bg-gray-50 border-gray-200"
    );
  };

  const getMetalGradient = (metalType: string) => {
    const gradients = {
      gold: "from-yellow-500 to-amber-600",
      silver: "from-gray-400 to-gray-600",
      "rose gold": "from-rose-400 to-pink-600",
      "sterling silver": "from-blue-400 to-blue-600",
    };
    return (
      gradients[metalType as keyof typeof gradients] ||
      "from-gray-400 to-gray-600"
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-green-600" : "text-red-600";
  };

  const getChangeBgColor = (change: number) => {
    return change >= 0
      ? "bg-green-50 border-green-200"
      : "bg-red-50 border-red-200";
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <MdArrowUpward className="text-lg text-green-600" />
    ) : (
      <MdArrowDownward className="text-lg text-red-600" />
    );
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  if (loadingLiveRates && liveRates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Connecting to live market data..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl">
            <MdTrendingUp className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Live Metal Rates
            </h2>
            <p className="text-gray-600">
              Real-time prices updating every second
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">LIVE</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={refreshBasePrices}
            disabled={loadingLiveRates}
            className="flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 focus:outline-none focus:ring-0"
            aria-label="Refresh base prices"
          >
            <MdRefresh
              className={`text-lg ${loadingLiveRates ? "animate-spin" : ""}`}
            />
            {loadingLiveRates ? "Refreshing..." : "Refresh Base"}
          </motion.button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <MdSchedule className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Last Update
            </span>
          </div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {lastUpdated?.toLocaleTimeString() || "--:--:--"}
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Update Count</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {updateCount.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm font-medium text-gray-700">Status</div>
          <div className="mt-1 text-lg font-semibold text-green-600">
            Connected
          </div>
        </div>
      </div>

      {/* Live Rates Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {liveRates.map((rate, index) => (
          <motion.div
            key={rate.metal}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${getMetalBgColor(
              rate.metal
            )}`}
          >
            {/* Metal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-r ${getMetalGradient(
                    rate.metal
                  )}`}
                >
                  <MdTrendingUp className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 capitalize">
                    {rate.metal}
                  </h3>
                  <p className="text-sm text-gray-600">{rate.purity} Purity</p>
                </div>
              </div>
            </div>

            {/* Price Display */}
            <div className="mb-4 text-center">
              <motion.div
                key={`${rate.metal}-${rate.price}`}
                // initial={{
                //   scale: 1.05,
                //   backgroundColor: rate.change >= 0 ? "#dcfce7" : "#fee2e2",
                // }}
                animate={{ scale: 1, backgroundColor: "transparent" }}
                transition={{ duration: 0.5 }}
                className="p-2 mb-1 text-3xl font-bold text-gray-900 rounded"
              >
                ₹{formatPrice(rate.price)}
              </motion.div>
              <div className="text-sm font-medium text-gray-500">per gram</div>
            </div>

            {/* Price Change */}
            <motion.div
              key={`${rate.metal}-change-${rate.change}`}
              // initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${getChangeBgColor(
                rate.change
              )}`}
            >
              {getChangeIcon(rate.change)}
              <div
                className={`text-sm font-semibold ${getChangeColor(
                  rate.change
                )}`}
              >
                ₹{Math.abs(rate.change).toFixed(2)}
                <span className="ml-1">
                  ({rate.changePercent >= 0 ? "+" : ""}
                  {rate.changePercent.toFixed(2)}%)
                </span>
              </div>
            </motion.div>

            {/* Additional Info */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Updates:</span>
                <span className="font-medium">Every second</span>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>Last:</span>
                <span className="font-medium">
                  {new Date(rate.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Section */}
      <div className="p-6 border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            ⚡ Real-time Market Simulation
          </h3>
          <p className="max-w-2xl mx-auto text-sm text-gray-600">
            Prices update every second with realistic market fluctuations. Gold
            typically has lower volatility (±0.05%) while silver has higher
            volatility (±0.1%). Click "Refresh Base" to get fresh market prices
            from the API.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
