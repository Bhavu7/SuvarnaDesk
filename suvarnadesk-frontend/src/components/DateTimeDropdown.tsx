import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdKeyboardArrowDown, MdAccessTime } from "react-icons/md";

interface DateTimeDropdownProps {
  value: string; // ISO string or empty
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  timeInterval?: number;
}

const DateTimeDropdown: React.FC<DateTimeDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select date and time",
  className = "",
  disabled = false,
  timeInterval = 30,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

  const months = [
    { value: 0, label: "Jan" },
    { value: 1, label: "Feb" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Apr" },
    { value: 4, label: "May" },
    { value: 5, label: "Jun" },
    { value: 6, label: "Jul" },
    { value: 7, label: "Aug" },
    { value: 8, label: "Sep" },
    { value: 9, label: "Oct" },
    { value: 10, label: "Nov" },
    { value: 11, label: "Dec" },
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += timeInterval) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const selectedDateTime = value ? new Date(value) : null;
  const [selectedYear, setSelectedYear] = useState<number | null>(
    selectedDateTime?.getFullYear() || null
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    selectedDateTime?.getMonth() || null
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(
    selectedDateTime?.getDate() || null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    selectedDateTime
      ? `${selectedDateTime
          .getHours()
          .toString()
          .padStart(2, "0")}:${selectedDateTime
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      : null
  );

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleDateSelect = (
    type: "year" | "month" | "day" | "time",
    selectedValue: number | string
  ) => {
    let newYear = selectedYear;
    let newMonth = selectedMonth;
    let newDay = selectedDay;
    let newTime = selectedTime;

    switch (type) {
      case "year":
        newYear = selectedValue as number;
        break;
      case "month":
        newMonth = selectedValue as number;
        newDay = null;
        break;
      case "day":
        newDay = selectedValue as number;
        break;
      case "time":
        newTime = selectedValue as string;
        break;
    }

    // Update local state
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    setSelectedDay(newDay);
    setSelectedTime(newTime);

    // Only call onChange when we have a complete date
    if (
      newYear !== null &&
      newMonth !== null &&
      newDay !== null &&
      newTime !== null
    ) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(newYear, newMonth, newDay, hours, minutes);
      onChange(newDate.toISOString());
    }
  };

  const clearSelection = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedDay(null);
    setSelectedTime(null);
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
          w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-0 focus:border-transparent transition-all duration-200
          flex items-center justify-between
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-gray-400"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <MdAccessTime className="text-gray-400" />
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value ? formatDateTime(value) : placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <MdKeyboardArrowDown className="text-xl text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 right-0 z-50 mt-1 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg top-full max-h-96"
          >
            <div className="flex flex-col h-96">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Select Date & Time
                  </span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-blue-600 transition-colors hover:text-blue-800 focus:outline-none focus:ring-0"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-4 gap-1 p-2 overflow-auto">
                <div className="overflow-y-auto max-h-72">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500">
                    Year
                  </div>
                  {years.map((year) => (
                    <motion.button
                      key={year}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      onClick={() => handleDateSelect("year", year)}
                      className={`
                        w-full px-2 py-1.5 text-left text-sm transition-colors duration-200 rounded focus:outline-none focus:ring-0
                        ${
                          selectedYear === year
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }
                        focus:outline-none
                      `}
                    >
                      {year}
                    </motion.button>
                  ))}
                </div>

                <div className="overflow-y-auto max-h-72">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500">
                    Month
                  </div>
                  {months.map((month) => (
                    <motion.button
                      key={month.value}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      onClick={() => handleDateSelect("month", month.value)}
                      disabled={selectedYear === null}
                      className={`
                        w-full px-2 py-1.5 text-left text-sm transition-colors duration-200 rounded focus:outline-none focus:ring-0
                        ${
                          selectedMonth === month.value
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }
                        ${
                          selectedYear === null
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                        focus:outline-none
                      `}
                    >
                      {month.label}
                    </motion.button>
                  ))}
                </div>

                <div className="overflow-y-auto max-h-72">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500">
                    Day
                  </div>
                  {days.map((day) => (
                    <motion.button
                      key={day}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      onClick={() => handleDateSelect("day", day)}
                      disabled={selectedMonth === null || selectedYear === null}
                      className={`
                        w-full px-2 py-1.5 text-left text-sm transition-colors duration-200 rounded focus:outline-none focus:ring-0
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
                        focus:outline-none
                      `}
                    >
                      {day}
                    </motion.button>
                  ))}
                </div>

                <div className="overflow-y-auto max-h-72">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500">
                    Time
                  </div>
                  {timeSlots.map((time) => (
                    <motion.button
                      key={time}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      onClick={() => handleDateSelect("time", time)}
                      disabled={selectedDay === null}
                      className={`
                        w-full px-2 py-1.5 text-left text-sm transition-colors duration-200 rounded focus:outline-none focus:ring-0
                        ${
                          selectedTime === time
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }
                        ${
                          selectedDay === null
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                        focus:outline-none
                      `}
                    >
                      {time}
                    </motion.button>
                  ))}
                </div>
              </div>

              {value && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-600">
                    Selected:{" "}
                    <span className="font-medium">{formatDateTime(value)}</span>
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

export default DateTimeDropdown;
