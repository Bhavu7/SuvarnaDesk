import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdKeyboardArrowDown, MdCalendarToday } from "react-icons/md";

interface DateRangeDropdownProps {
  startDate: string; // ISO string or empty
  endDate: string; // ISO string or empty
  onChange: (startDate: string, endDate: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const DateRangeDropdown: React.FC<DateRangeDropdownProps> = ({
  startDate,
  endDate,
  onChange,
  placeholder = "Select date range",
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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // State for start date selection
  const startSelectedDate = startDate ? new Date(startDate) : null;
  const [startSelectedYear, setStartSelectedYear] = useState<number | null>(
    startSelectedDate?.getFullYear() || null
  );
  const [startSelectedMonth, setStartSelectedMonth] = useState<number | null>(
    startSelectedDate?.getMonth() || null
  );
  const [startSelectedDay, setStartSelectedDay] = useState<number | null>(
    startSelectedDate?.getDate() || null
  );

  // State for end date selection
  const endSelectedDate = endDate ? new Date(endDate) : null;
  const [endSelectedYear, setEndSelectedYear] = useState<number | null>(
    endSelectedDate?.getFullYear() || null
  );
  const [endSelectedMonth, setEndSelectedMonth] = useState<number | null>(
    endSelectedDate?.getMonth() || null
  );
  const [endSelectedDay, setEndSelectedDay] = useState<number | null>(
    endSelectedDate?.getDate() || null
  );

  // Update start date when all components are selected
  useEffect(() => {
    if (
      startSelectedYear !== null &&
      startSelectedMonth !== null &&
      startSelectedDay !== null
    ) {
      const newDate = new Date(
        startSelectedYear,
        startSelectedMonth,
        startSelectedDay
      );
      const newDateString = newDate.toISOString().split("T")[0];

      if (newDateString !== startDate) {
        // Validate that start date is not after end date
        if (endDate && newDate > new Date(endDate)) {
          showTemporaryError("Start date cannot be after end date");
          return;
        }
        onChange(newDateString, endDate);
      }
    }
  }, [
    startSelectedYear,
    startSelectedMonth,
    startSelectedDay,
    startDate,
    endDate,
    onChange,
  ]);

  // Update end date when all components are selected
  useEffect(() => {
    if (
      endSelectedYear !== null &&
      endSelectedMonth !== null &&
      endSelectedDay !== null
    ) {
      const newDate = new Date(
        endSelectedYear,
        endSelectedMonth,
        endSelectedDay
      );
      const newDateString = newDate.toISOString().split("T")[0];

      if (newDateString !== endDate) {
        // Validate that end date is not before start date
        if (startDate && newDate < new Date(startDate)) {
          showTemporaryError("End date cannot be before start date");
          return;
        }
        onChange(startDate, newDateString);
      }
    }
  }, [
    endSelectedYear,
    endSelectedMonth,
    endSelectedDay,
    startDate,
    endDate,
    onChange,
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showTemporaryError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const handleDateSelect = (
    type:
      | "start-year"
      | "start-month"
      | "start-day"
      | "end-year"
      | "end-month"
      | "end-day",
    selectedValue: number
  ) => {
    switch (type) {
      case "start-year":
        setStartSelectedYear(selectedValue);
        break;
      case "start-month":
        setStartSelectedMonth(selectedValue);
        setStartSelectedDay(null);
        break;
      case "start-day":
        setStartSelectedDay(selectedValue);
        break;
      case "end-year":
        setEndSelectedYear(selectedValue);
        break;
      case "end-month":
        setEndSelectedMonth(selectedValue);
        setEndSelectedDay(null);
        break;
      case "end-day":
        setEndSelectedDay(selectedValue);
        break;
    }
  };

  const clearSelection = () => {
    setStartSelectedYear(null);
    setStartSelectedMonth(null);
    setStartSelectedDay(null);
    setEndSelectedYear(null);
    setEndSelectedMonth(null);
    setEndSelectedDay(null);
    onChange("", "");
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

  const startDays =
    startSelectedYear !== null && startSelectedMonth !== null
      ? Array.from(
          { length: getDaysInMonth(startSelectedYear, startSelectedMonth) },
          (_, i) => i + 1
        )
      : [];

  const endDays =
    endSelectedYear !== null && endSelectedMonth !== null
      ? Array.from(
          { length: getDaysInMonth(endSelectedYear, endSelectedMonth) },
          (_, i) => i + 1
        )
      : [];

  const formatDisplayText = () => {
    if (!startDate && !endDate) return placeholder;
    if (startDate && !endDate) return `From ${formatDate(startDate)}`;
    if (!startDate && endDate) return `To ${formatDate(endDate)}`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition-all duration-200
          flex items-center justify-between
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-gray-400"
          }
          ${errorMessage ? "border-red-300" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <MdCalendarToday
            className={`text-sm ${
              errorMessage ? "text-red-400" : "text-gray-400"
            }`}
          />
          <span
            className={`text-sm ${
              startDate || endDate ? "text-gray-900" : "text-gray-500"
            } ${errorMessage ? "text-red-600" : ""}`}
          >
            {formatDisplayText()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {errorMessage && (
            <span className="text-xs text-red-500 animate-pulse">!</span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <MdKeyboardArrowDown
              className={`text-lg ${
                errorMessage ? "text-red-400" : "text-gray-400"
              }`}
            />
          </motion.div>
        </div>
      </motion.button>

      {errorMessage && (
        <div className="absolute left-0 right-0 px-2 py-1 mt-1 text-xs text-red-600 border border-red-200 rounded bg-red-50">
          {errorMessage}
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 right-0 z-50 mt-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg top-full max-h-80 sm:max-h-96"
          >
            <div className="flex flex-col h-80 sm:h-96">
              <div className="p-2 border-b border-gray-200 sm:p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 sm:text-sm">
                    Select Date Range
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-blue-600 transition-colors sm:text-sm hover:text-blue-800 focus:outline-none focus:ring-0"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-1 p-1 overflow-auto sm:p-2">
                {/* Start Date Section */}
                <div className="pr-1 border-r border-gray-200">
                  <div className="sticky top-0 z-10 px-1 py-1 mb-1 text-xs font-medium text-gray-700 bg-white sm:px-2">
                    Start Date
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="overflow-y-auto">
                      <div className="px-1 py-1 text-xs font-medium text-gray-500 sm:px-2">
                        Year
                      </div>
                      {years.map((year) => (
                        <motion.button
                          key={`start-year-${year}`}
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          onClick={() => handleDateSelect("start-year", year)}
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              startSelectedYear === year
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
                          key={`start-month-${month.value}`}
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          onClick={() =>
                            handleDateSelect("start-month", month.value)
                          }
                          disabled={startSelectedYear === null}
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              startSelectedMonth === month.value
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }
                            ${
                              startSelectedYear === null
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
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
                      {startDays.map((day) => (
                        <motion.button
                          key={`start-day-${day}`}
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          onClick={() => handleDateSelect("start-day", day)}
                          disabled={
                            startSelectedMonth === null ||
                            startSelectedYear === null
                          }
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              startSelectedDay === day
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }
                            ${
                              startSelectedMonth === null ||
                              startSelectedYear === null
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
                </div>

                {/* End Date Section */}
                <div className="pl-1">
                  <div className="sticky top-0 z-10 px-1 py-1 mb-1 text-xs font-medium text-gray-700 bg-white sm:px-2">
                    End Date
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="overflow-y-auto">
                      <div className="px-1 py-1 text-xs font-medium text-gray-500 sm:px-2">
                        Year
                      </div>
                      {years.map((year) => (
                        <motion.button
                          key={`end-year-${year}`}
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          onClick={() => handleDateSelect("end-year", year)}
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              endSelectedYear === year
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
                          key={`end-month-${month.value}`}
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          onClick={() =>
                            handleDateSelect("end-month", month.value)
                          }
                          disabled={endSelectedYear === null}
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              endSelectedMonth === month.value
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }
                            ${
                              endSelectedYear === null
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
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
                      {endDays.map((day) => (
                        <motion.button
                          key={`end-day-${day}`}
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          onClick={() => handleDateSelect("end-day", day)}
                          disabled={
                            endSelectedMonth === null ||
                            endSelectedYear === null
                          }
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              endSelectedDay === day
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }
                            ${
                              endSelectedMonth === null ||
                              endSelectedYear === null
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
                </div>
              </div>

              {(startDate || endDate) && (
                <div className="p-2 border-t border-gray-200 sm:p-3 bg-gray-50">
                  <div className="text-xs text-gray-600">
                    {startDate && endDate ? (
                      <>
                        Selected:{" "}
                        <span className="font-medium">
                          {formatDate(startDate)}
                        </span>
                        {" to "}
                        <span className="font-medium">
                          {formatDate(endDate)}
                        </span>
                      </>
                    ) : startDate ? (
                      <>
                        Start Date:{" "}
                        <span className="font-medium">
                          {formatDate(startDate)}
                        </span>
                        {" (select end date)"}
                      </>
                    ) : (
                      <>
                        End Date:{" "}
                        <span className="font-medium">
                          {formatDate(endDate)}
                        </span>
                        {" (select start date)"}
                      </>
                    )}
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

export default DateRangeDropdown;
