import { useState, useRef, useEffect } from 'react';
import { Icons } from '../icons/icons';

interface Option {
  label: string;
  value: string;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  textColor?: string;
  backgroundColor?: string;
  maxHeight?: string;
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  textColor = 'text-black',
  backgroundColor = 'bg-white',
  maxHeight = '300px'
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Current selection display */}
      <div
        onClick={toggleDropdown}
        className={`flex items-center justify-between p-1 text-xs rounded border ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : `${backgroundColor} cursor-pointer`
        } ${textColor} ${isOpen ? 'border-blue-500' : 'border-gray-300'} transition-colors duration-150`}
      >
        <div className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <Icons.ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {/* Dropdown content */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 ${backgroundColor} border border-gray-300 rounded shadow-lg`}>
          {/* Search input */}
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
          
          {/* Options list */}
          <div className={`overflow-y-auto max-h-[${maxHeight}]`} style={{ maxHeight }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`p-1.5 text-xs hover:bg-gray-100 cursor-pointer ${
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
