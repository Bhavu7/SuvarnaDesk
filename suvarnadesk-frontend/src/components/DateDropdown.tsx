import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdKeyboardArrowDown, MdCalendarToday } from "react-icons/md";

interface DateDropdownProps {
  value: string; // ISO string or empty
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const DateDropdown: React.FC<DateDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select a date",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

  const months = [
    { value: 0, label: "January" },
    { value: 1, label: "February" },
    { value: 2, label: "March" },
    { value: 3, label: "April" },
    { value: 4, label: "May" },
    { value: 5, label: "June" },
    { value: 6, label: "July" },
    { value: 7, label: "August" },
    { value: 8, label: "September" },
    { value: 9, label: "October" },
    { value: 10, label: "November" },
    { value: 11, label: "December" },
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const selectedDate = value ? new Date(value) : null;
  const [selectedYear, setSelectedYear] = useState<number | null>(
    selectedDate?.getFullYear() || null
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    selectedDate?.getMonth() || null
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(
    selectedDate?.getDate() || null
  );

  useEffect(() => {
    if (
      selectedYear !== null &&
      selectedMonth !== null &&
      selectedDay !== null
    ) {
      const newDate = new Date(selectedYear, selectedMonth, selectedDay);
      const newDateString = newDate.toISOString().split("T")[0];

      // Only call onChange if the date actually changed
      if (newDateString !== value) {
        onChange(newDateString);
      }
    }
  }, [selectedYear, selectedMonth, selectedDay, onChange, value]);

  const handleDateSelect = (
    type: "year" | "month" | "day",
    selectedValue: number
  ) => {
    switch (type) {
      case "year":
        setSelectedYear(selectedValue);
        break;
      case "month":
        setSelectedMonth(selectedValue);
        setSelectedDay(null);
        break;
      case "day":
        setSelectedDay(selectedValue);
        break;
    }
  };

  const clearSelection = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedDay(null);
    onChange("");
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days =
    selectedYear !== null && selectedMonth !== null
      ? Array.from(
          { length: getDaysInMonth(selectedYear, selectedMonth) },
          (_, i) => i + 1
        )
      : [];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
    w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg 
    focus:outline-none focus:ring-0 focus:border-transparent transition-all duration-200
    flex items-center justify-between
    ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer hover:border-gray-400"
    }
  `}
      >
        <div className="flex items-center gap-2">
          <MdCalendarToday className="text-sm text-gray-400" />
          <span
            className={`text-sm ${value ? "text-gray-900" : "text-gray-500"}`}
          >
            {value ? formatDate(value) : placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <MdKeyboardArrowDown className="text-lg text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 right-0 z-50 mt-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg top-full max-h-64 sm:max-h-80"
          >
            <div className="flex flex-col h-64 sm:h-80">
              <div className="p-2 border-b border-gray-200 sm:p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 sm:text-sm">
                    Select Date
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-blue-600 transition-colors sm:text-sm hover:text-blue-800 focus:outline-none focus:ring-0"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-3 gap-1 p-1 overflow-auto sm:p-2">
                <div className="overflow-y-auto">
                  <div className="px-1 py-1 text-xs font-medium text-gray-500 sm:px-2">
                    Year
                  </div>
                  {years.map((year) => (
                    <motion.button
                      key={year}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      onClick={() => handleDateSelect("year", year)}
                      className={`
              w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm transition-colors duration-200 rounded focus:outline-none focus:ring-0
              ${
                selectedYear === year
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }
            `}
                    >
                      {year}
                    </motion.button>
                  ))}
                </div>

                <div className="overflow-y-auto">
                  <div className="px-1 py-1 text-xs font-medium text-gray-500 sm:px-2">
                    Month
                  </div>
                  {months.map((month) => (
                    <motion.button
                      key={month.value}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      onClick={() => handleDateSelect("month", month.value)}
                      disabled={selectedYear === null}
                      className={`
              w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm transition-colors duration-200 rounded focus:outline-none focus:ring-0
              ${
                selectedMonth === month.value
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }
              ${selectedYear === null ? "opacity-50 cursor-not-allowed" : ""}
            `}
                    >
                      {month.label}
                    </motion.button>
                  ))}
                </div>

                <div className="overflow-y-auto">
                  <div className="px-1 py-1 text-xs font-medium text-gray-500 sm:px-2">
                    Day
                  </div>
                  {days.map((day) => (
                    <motion.button
                      key={day}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      onClick={() => handleDateSelect("day", day)}
                      disabled={selectedMonth === null || selectedYear === null}
                      className={`
              w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm transition-colors duration-200 rounded focus:outline-none focus:ring-0
              ${
                selectedDay === day
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              }
              ${
                selectedMonth === null || selectedYear === null
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            `}
                    >
                      {day}
                    </motion.button>
                  ))}
                </div>
              </div>

              {value && (
                <div className="p-2 border-t border-gray-200 sm:p-3 bg-gray-50">
                  <div className="text-xs text-gray-600">
                    Selected:{" "}
                    <span className="font-medium">{formatDate(value)}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateDropdown;
