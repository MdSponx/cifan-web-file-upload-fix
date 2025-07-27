import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Comprehensive list of countries
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
  'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
  'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco',
  'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa',
  'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
  'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
  'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen',
  'Zambia', 'Zimbabwe'
];

// Country flag emojis mapping
const countryFlags: { [key: string]: string } = {
  'Afghanistan': '🇦🇫', 'Albania': '🇦🇱', 'Algeria': '🇩🇿', 'Andorra': '🇦🇩', 'Angola': '🇦🇴',
  'Argentina': '🇦🇷', 'Armenia': '🇦🇲', 'Australia': '🇦🇺', 'Austria': '🇦🇹', 'Azerbaijan': '🇦🇿',
  'Bahamas': '🇧🇸', 'Bahrain': '🇧🇭', 'Bangladesh': '🇧🇩', 'Barbados': '🇧🇧', 'Belarus': '🇧🇾',
  'Belgium': '🇧🇪', 'Belize': '🇧🇿', 'Benin': '🇧🇯', 'Bhutan': '🇧🇹', 'Bolivia': '🇧🇴',
  'Bosnia and Herzegovina': '🇧🇦', 'Botswana': '🇧🇼', 'Brazil': '🇧🇷', 'Brunei': '🇧🇳',
  'Bulgaria': '🇧🇬', 'Burkina Faso': '🇧🇫', 'Burundi': '🇧🇮', 'Cambodia': '🇰🇭',
  'Cameroon': '🇨🇲', 'Canada': '🇨🇦', 'Cape Verde': '🇨🇻', 'Central African Republic': '🇨🇫',
  'Chad': '🇹🇩', 'Chile': '🇨🇱', 'China': '🇨🇳', 'Colombia': '🇨🇴', 'Comoros': '🇰🇲',
  'Congo': '🇨🇬', 'Costa Rica': '🇨🇷', 'Croatia': '🇭🇷', 'Cuba': '🇨🇺', 'Cyprus': '🇨🇾',
  'Czech Republic': '🇨🇿', 'Denmark': '🇩🇰', 'Djibouti': '🇩🇯', 'Dominica': '🇩🇲',
  'Dominican Republic': '🇩🇴', 'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'El Salvador': '🇸🇻',
  'Equatorial Guinea': '🇬🇶', 'Eritrea': '🇪🇷', 'Estonia': '🇪🇪', 'Eswatini': '🇸🇿',
  'Ethiopia': '🇪🇹', 'Fiji': '🇫🇯', 'Finland': '🇫🇮', 'France': '🇫🇷', 'Gabon': '🇬🇦',
  'Gambia': '🇬🇲', 'Georgia': '🇬🇪', 'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Greece': '🇬🇷',
  'Grenada': '🇬🇩', 'Guatemala': '🇬🇹', 'Guinea': '🇬🇳', 'Guinea-Bissau': '🇬🇼',
  'Guyana': '🇬🇾', 'Haiti': '🇭🇹', 'Honduras': '🇭🇳', 'Hungary': '🇭🇺', 'Iceland': '🇮🇸',
  'India': '🇮🇳', 'Indonesia': '🇮🇩', 'Iran': '🇮🇷', 'Iraq': '🇮🇶', 'Ireland': '🇮🇪',
  'Israel': '🇮🇱', 'Italy': '🇮🇹', 'Jamaica': '🇯🇲', 'Japan': '🇯🇵', 'Jordan': '🇯🇴',
  'Kazakhstan': '🇰🇿', 'Kenya': '🇰🇪', 'Kiribati': '🇰🇮', 'Kuwait': '🇰🇼',
  'Kyrgyzstan': '🇰🇬', 'Laos': '🇱🇦', 'Latvia': '🇱🇻', 'Lebanon': '🇱🇧', 'Lesotho': '🇱🇸',
  'Liberia': '🇱🇷', 'Libya': '🇱🇾', 'Liechtenstein': '🇱🇮', 'Lithuania': '🇱🇹',
  'Luxembourg': '🇱🇺', 'Madagascar': '🇲🇬', 'Malawi': '🇲🇼', 'Malaysia': '🇲🇾',
  'Maldives': '🇲🇻', 'Mali': '🇲🇱', 'Malta': '🇲🇹', 'Marshall Islands': '🇲🇭',
  'Mauritania': '🇲🇷', 'Mauritius': '🇲🇺', 'Mexico': '🇲🇽', 'Micronesia': '🇫🇲',
  'Moldova': '🇲🇩', 'Monaco': '🇲🇨', 'Mongolia': '🇲🇳', 'Montenegro': '🇲🇪',
  'Morocco': '🇲🇦', 'Mozambique': '🇲🇿', 'Myanmar': '🇲🇲', 'Namibia': '🇳🇦',
  'Nauru': '🇳🇷', 'Nepal': '🇳🇵', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿',
  'Nicaragua': '🇳🇮', 'Niger': '🇳🇪', 'Nigeria': '🇳🇬', 'North Korea': '🇰🇵',
  'North Macedonia': '🇲🇰', 'Norway': '🇳🇴', 'Oman': '🇴🇲', 'Pakistan': '🇵🇰',
  'Palau': '🇵🇼', 'Palestine': '🇵🇸', 'Panama': '🇵🇦', 'Papua New Guinea': '🇵🇬',
  'Paraguay': '🇵🇾', 'Peru': '🇵🇪', 'Philippines': '🇵🇭', 'Poland': '🇵🇱',
  'Portugal': '🇵🇹', 'Qatar': '🇶🇦', 'Romania': '🇷🇴', 'Russia': '🇷🇺', 'Rwanda': '🇷🇼',
  'Saint Kitts and Nevis': '🇰🇳', 'Saint Lucia': '🇱🇨', 'Saint Vincent and the Grenadines': '🇻🇨',
  'Samoa': '🇼🇸', 'San Marino': '🇸🇲', 'Sao Tome and Principe': '🇸🇹',
  'Saudi Arabia': '🇸🇦', 'Senegal': '🇸🇳', 'Serbia': '🇷🇸', 'Seychelles': '🇸🇨',
  'Sierra Leone': '🇸🇱', 'Singapore': '🇸🇬', 'Slovakia': '🇸🇰', 'Slovenia': '🇸🇮',
  'Solomon Islands': '🇸🇧', 'Somalia': '🇸🇴', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷',
  'South Sudan': '🇸🇸', 'Spain': '🇪🇸', 'Sri Lanka': '🇱🇰', 'Sudan': '🇸🇩',
  'Suriname': '🇸🇷', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Syria': '🇸🇾',
  'Taiwan': '🇹🇼', 'Tajikistan': '🇹🇯', 'Tanzania': '🇹🇿', 'Thailand': '🇹🇭',
  'Timor-Leste': '🇹🇱', 'Togo': '🇹🇬', 'Tonga': '🇹🇴', 'Trinidad and Tobago': '🇹🇹',
  'Tunisia': '🇹🇳', 'Turkey': '🇹🇷', 'Turkmenistan': '🇹🇲', 'Tuvalu': '🇹🇻',
  'Uganda': '🇺🇬', 'Ukraine': '🇺🇦', 'United Arab Emirates': '🇦🇪', 'United Kingdom': '🇬🇧',
  'United States': '🇺🇸', 'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿', 'Vanuatu': '🇻🇺',
  'Vatican City': '🇻🇦', 'Venezuela': '🇻🇪', 'Vietnam': '🇻🇳', 'Yemen': '🇾🇪',
  'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼'
};

interface NationalitySelectorProps {
  onNationalityChange: (nationality: string) => void;
  onNationalityTypeChange: (isThaiNationality: boolean) => void;
  className?: string;
}

const NationalitySelector: React.FC<NationalitySelectorProps> = ({
  onNationalityChange,
  onNationalityTypeChange,
  className = ''
}) => {
  const { i18n } = useTranslation();
  const [nationalityType, setNationalityType] = useState<'thai' | 'international'>('thai');
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic typography classes based on language
  const getTypographyClass = (baseClass: string) => {
    return i18n.language === 'th' ? `${baseClass}-th` : `${baseClass}-en`;
  };

  const currentLanguage = i18n.language as 'en' | 'th';

  const content = {
    th: {
      nationalityTitle: "สัญชาติ",
      thaiOption: "ไทย",
      internationalOption: "นานาชาติ",
      searchCountry: "ค้นหาประเทศ..."
    },
    en: {
      nationalityTitle: "Nationality",
      thaiOption: "THAI",
      internationalOption: "International",
      searchCountry: "Search country..."
    }
  };

  const currentContent = content[currentLanguage];

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  ).slice(0, 10); // Show top 10 matches

  // Enhanced blur handling with delay
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowCountrySuggestions(false);
    }, 200);
  };

  // Prevent blur when clicking dropdown items
  const handleDropdownMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Handle nationality type change
  const handleNationalityTypeChange = (type: 'thai' | 'international') => {
    setNationalityType(type);
    
    if (type === 'thai') {
      // Auto-set to Thailand for Thai nationality
      onNationalityChange('Thailand');
      onNationalityTypeChange(true);
      setCountrySearch('');
    } else {
      // CRITICAL FIX: When switching to 'international', immediately set parent nationality to empty
      // and clear the local country search state.
      onNationalityChange(''); // Set parent form's nationality to empty string
      onNationalityTypeChange(false);
      setCountrySearch(''); // Clear local search input
    }
  };

  // Handle country selection
  const handleCountrySelect = (country: string) => {
    setCountrySearch(country);
    onNationalityChange(country);
    setShowCountrySuggestions(false);
  };

  // Handle country search input change
  const handleCountrySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountrySearch(value);
    onNationalityChange(value);
    setShowCountrySuggestions(true);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowCountrySuggestions(true);
  };

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowCountrySuggestions(false);
      }
    };

    if (showCountrySuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountrySuggestions]);

  // Initialize with Thai nationality on mount
  useEffect(() => {
    onNationalityChange('Thailand');
    onNationalityTypeChange(true);
  }, [onNationalityChange, onNationalityTypeChange]);

  return (
    <div className={`glass-container form-section-container rounded-xl sm:rounded-2xl p-6 sm:p-8 ${className}`} style={{ overflow: 'visible' }}>
      <h3 className={`text-lg sm:text-xl ${getTypographyClass('subtitle')} text-white mb-6`}>
        🌍 {currentContent.nationalityTitle}
      </h3>
      
      {/* Nationality Type Radio Buttons */}
      <div className="mb-6 overflow-visible">
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="nationalityType"
              value="thai"
              checked={nationalityType === 'thai'}
              onChange={() => handleNationalityTypeChange('thai')}
              className="w-4 h-4 text-[#FCB283] bg-white/10 border-white/20 focus:ring-[#FCB283] focus:ring-2"
            />
            <span className={`${getTypographyClass('body')} text-white flex items-center space-x-2`}>
              <span>🇹🇭</span>
              <span>{currentContent.thaiOption}</span>
            </span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="nationalityType"
              value="international"
              checked={nationalityType === 'international'}
              onChange={() => handleNationalityTypeChange('international')}
              className="w-4 h-4 text-[#FCB283] bg-white/10 border-white/20 focus:ring-[#FCB283] focus:ring-2"
            />
            <span className={`${getTypographyClass('body')} text-white flex items-center space-x-2`}>
              <span>🌍</span>
              <span>{currentContent.internationalOption}</span>
            </span>
          </label>
        </div>
      </div>

      {/* International Country Selector */}
      {nationalityType === 'international' && (
        <div className="relative" style={{ zIndex: 1000, overflow: 'visible' }}>
          <label className={`block text-white/90 ${getTypographyClass('body')} mb-2`}>
            {currentContent.searchCountry.replace('...', '')} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            ref={inputRef}
            value={countrySearch}
            onChange={handleCountrySearchChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={currentContent.searchCountry}
            autoComplete="off"
            required
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none relative z-10"
          />
          
          {/* Country Suggestions */}
          {showCountrySuggestions && countrySearch && filteredCountries.length > 0 && (
            <div 
              ref={dropdownRef}
              className="nationality-dropdown absolute left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-lg shadow-2xl overflow-hidden"
              style={{ 
                zIndex: 9999,
                maxHeight: '240px',
                overflowY: 'auto',
                top: '100%',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)'
              }}
            >
              {filteredCountries.map((country, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  onMouseDown={handleDropdownMouseDown}
                  className="nationality-dropdown-item w-full text-left px-4 py-3 hover:bg-white/10 active:bg-white/20 transition-colors text-white flex items-center space-x-3 border-none focus:outline-none focus:bg-white/10"
                >
                  <span className="text-lg">{countryFlags[country] || '🏳️'}</span>
                  <span>{country}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NationalitySelector;