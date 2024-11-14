import React from 'react';
import useTranslation from '../hooks/useTranslation';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/ui/dropdown-menu";
import { Button } from "@/components/ui/button";


const LanguageSelector = () => {
    const { changeLanguage, language } = useTranslation();
    const languages = [
      { code: 'en', name: 'English',index:'EN' },
      { code: 'fr', name: 'Français',index: 'FR' },
      { code: 'de', name: 'Deutsch',index: 'DE'  },
      // Add more languages as needed
    ];

    const handleLanguageChange = (langCode) => {
      changeLanguage(langCode);
      localStorage.setItem("preferredLanguage",langCode);
    };

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="px-2 py-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-950 cursor-pointer">
          <Languages className="h-5 w-5 mr-2" />
          {languages.find(lang => lang.code === language)?.index || 'Select Language'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {languages.map((lang) => (
            <DropdownMenuItem 
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={language === lang.code ? 'bg-accent' : ''}
            >
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    
  );
};

export default LanguageSelector;