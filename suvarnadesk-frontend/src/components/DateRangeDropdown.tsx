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

  // Parse dates from props
  const startSelectedDate = startDate ? new Date(startDate) : null;
  const endSelectedDate = endDate ? new Date(endDate) : null;

  // Track temporary selections that haven't been applied yet
  const [tempStartYear, setTempStartYear] = useState<number | null>(
    startSelectedDate?.getFullYear() || null
  );
  const [tempStartMonth, setTempStartMonth] = useState<number | null>(
    startSelectedDate?.getMonth() || null
  );
  const [tempStartDay, setTempStartDay] = useState<number | null>(
    startSelectedDate?.getDate() || null
  );

  const [tempEndYear, setTempEndYear] = useState<number | null>(
    endSelectedDate?.getFullYear() || null
  );
  const [tempEndMonth, setTempEndMonth] = useState<number | null>(
    endSelectedDate?.getMonth() || null
  );
  const [tempEndDay, setTempEndDay] = useState<number | null>(
    endSelectedDate?.getDate() || null
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset temp selections when props change (but not when dropdown opens)
  useEffect(() => {
    if (startSelectedDate) {
      setTempStartYear(startSelectedDate.getFullYear());
      setTempStartMonth(startSelectedDate.getMonth());
      setTempStartDay(startSelectedDate.getDate());
    } else {
      setTempStartYear(null);
      setTempStartMonth(null);
      setTempStartDay(null);
    }

    if (endSelectedDate) {
      setTempEndYear(endSelectedDate.getFullYear());
      setTempEndMonth(endSelectedDate.getMonth());
      setTempEndDay(endSelectedDate.getDate());
    } else {
      setTempEndYear(null);
      setTempEndMonth(null);
      setTempEndDay(null);
    }
  }, [startDate, endDate]);

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
        setTempStartYear(selectedValue);
        setTempStartMonth(null);
        setTempStartDay(null);
        break;
      case "start-month":
        setTempStartMonth(selectedValue);
        setTempStartDay(null);
        break;
      case "start-day":
        setTempStartDay(selectedValue);
        // Auto-apply when start date is complete
        if (
          tempStartYear !== null &&
          tempStartMonth !== null &&
          selectedValue !== null
        ) {
          const newStartDate = new Date(
            tempStartYear,
            tempStartMonth,
            selectedValue
          );
          const newStartDateString = newStartDate.toISOString().split("T")[0];

          // Validate that start date is not after end date
          if (endDate && newStartDate > new Date(endDate)) {
            showTemporaryError("Start date cannot be after end date");
            return;
          }

          // Only update if different from current
          if (newStartDateString !== startDate) {
            onChange(newStartDateString, endDate);
          }
        }
        break;
      case "end-year":
        setTempEndYear(selectedValue);
        setTempEndMonth(null);
        setTempEndDay(null);
        break;
      case "end-month":
        setTempEndMonth(selectedValue);
        setTempEndDay(null);
        break;
      case "end-day":
        setTempEndDay(selectedValue);
        // Auto-apply when end date is complete
        if (
          tempEndYear !== null &&
          tempEndMonth !== null &&
          selectedValue !== null
        ) {
          const newEndDate = new Date(tempEndYear, tempEndMonth, selectedValue);
          const newEndDateString = newEndDate.toISOString().split("T")[0];

          // Validate that end date is not before start date
          if (startDate && newEndDate < new Date(startDate)) {
            showTemporaryError("End date cannot be before start date");
            return;
          }

          // Only update if different from current
          if (newEndDateString !== endDate) {
            onChange(startDate, newEndDateString);
          }
        }
        break;
    }
  };

  const applySelection = () => {
    // Validate and apply start date if complete
    if (
      tempStartYear !== null &&
      tempStartMonth !== null &&
      tempStartDay !== null
    ) {
      const newStartDate = new Date(
        tempStartYear,
        tempStartMonth,
        tempStartDay
      );
      const newStartDateString = newStartDate.toISOString().split("T")[0];

      // Validate that start date is not after end date
      if (endDate && newStartDate > new Date(endDate)) {
        showTemporaryError("Start date cannot be after end date");
        return;
      }

      if (newStartDateString !== startDate) {
        onChange(newStartDateString, endDate);
      }
    }

    // Validate and apply end date if complete
    if (tempEndYear !== null && tempEndMonth !== null && tempEndDay !== null) {
      const newEndDate = new Date(tempEndYear, tempEndMonth, tempEndDay);
      const newEndDateString = newEndDate.toISOString().split("T")[0];

      // Validate that end date is not before start date
      if (startDate && newEndDate < new Date(startDate)) {
        showTemporaryError("End date cannot be before start date");
        return;
      }

      if (newEndDateString !== endDate) {
        onChange(startDate, newEndDateString);
      }
    }

    setIsOpen(false);
  };

  const clearSelection = () => {
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
    tempStartYear !== null && tempStartMonth !== null
      ? Array.from(
          { length: getDaysInMonth(tempStartYear, tempStartMonth) },
          (_, i) => i + 1
        )
      : [];

  const endDays =
    tempEndYear !== null && tempEndMonth !== null
      ? Array.from(
          { length: getDaysInMonth(tempEndYear, tempEndMonth) },
          (_, i) => i + 1
        )
      : [];

  const formatDisplayText = () => {
    if (!startDate && !endDate) return placeholder;
    if (startDate && !endDate) return `From ${formatDate(startDate)}`;
    if (!startDate && endDate) return `To ${formatDate(endDate)}`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const isSelectionComplete = () => {
    const isStartComplete =
      tempStartYear !== null &&
      tempStartMonth !== null &&
      tempStartDay !== null;
    const isEndComplete =
      tempEndYear !== null && tempEndMonth !== null && tempEndDay !== null;
    return isStartComplete || isEndComplete;
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
                  <div className="flex gap-2">
                    <button
                      onClick={clearSelection}
                      className="text-xs text-blue-600 transition-colors sm:text-sm hover:text-blue-800 focus:outline-none focus:ring-0"
                    >
                      Clear
                    </button>
                    {isSelectionComplete() && (
                      <button
                        onClick={applySelection}
                        className="text-xs text-green-600 transition-colors sm:text-sm hover:text-green-800 focus:outline-none focus:ring-0"
                      >
                        Apply
                      </button>
                    )}
                  </div>
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
                              tempStartYear === year
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
                          disabled={tempStartYear === null}
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              tempStartMonth === month.value
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }
                            ${
                              tempStartYear === null
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
                            tempStartMonth === null || tempStartYear === null
                          }
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              tempStartDay === day
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }
                            ${
                              tempStartMonth === null || tempStartYear === null
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
                              tempEndYear === year
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
                          disabled={tempEndYear === null}
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              tempEndMonth === month.value
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }
                            ${
                              tempEndYear === null
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
                            tempEndMonth === null || tempEndYear === null
                          }
                          className={`
                            w-full px-2 sm:px-3 py-1 sm:py-2 text-left text-xs sm:text-sm 
                            transition-colors duration-200 rounded focus:outline-none focus:ring-0
                            ${
                              tempEndDay === day
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }
                            ${
                              tempEndMonth === null || tempEndYear === null
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
