import { useState, useRef, useEffect } from 'react';
import { Icons } from '../icons/icons';

interface Option {
  label: string;
  value: string;
}

export interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select an option',
  searchable = true,
  clearable = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);

  // Find the current selected option
  const selectedOption = options.find(option => option.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, []);

  // Prevent scroll propagation when dropdown is open
  useEffect(() => {
    const preventScrollPropagation = (e: WheelEvent) => {
      const target = e.target as Node;
      if (isOpen && optionsListRef.current && optionsListRef.current.contains(target)) {
        e.stopPropagation();
      }
    };

    // Use capture phase to intercept events before they reach other handlers
    window.addEventListener('wheel', preventScrollPropagation, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', preventScrollPropagation, { capture: true });
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      if (newIsOpen) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={dropdownRef} className={`relative w-full`}>
      {/* Current selection display */}
      <div
        onClick={toggleDropdown}
        className={`flex items-center justify-between p-1 text-xs rounded border ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : `bg-white cursor-pointer`
        } text-black ${isOpen ? 'border-blue-500' : 'border-gray-300'} transition-colors duration-150`}
      >
        <div className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <div className="flex items-center">
          {clearable && selectedOption && (
            <button 
              type="button"
              onClick={handleClear}
              className="mr-1 text-gray-400 hover:text-gray-600"
            >
              <Icons.FiX className="w-2.5 h-2.5" />
            </button>
          )}
          <Icons.ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
          {/* Search input */}
          {searchable && (
            <div className="p-1 border-b border-gray-200">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-1 pr-7 text-xs rounded border border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Search..."
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          {/* Options list */}
          <div 
            ref={optionsListRef}
            className="overflow-y-auto max-h-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`p-1.5 text-xs hover:bg-gray-100 cursor-pointer truncate ${
                    option.value === value ? 'bg-blue-50 font-medium' : ''
                  }`}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-1.5 text-xs text-gray-500 text-center">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
