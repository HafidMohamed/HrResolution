import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerFooter } from "@/app/ui/drawer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/app/ui/switch";
import { Label } from "@/components/ui/label";
import { coockieApi } from '@/services/api/cookieApi';

const CookieConsent = () => {
  const [open, setOpen] = useState(false);
  const [essentialCookies, setEssentialCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(false);
  const [marketingCookies, setMarketingCookies] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('userPreferences');
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleConsent = async () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const userPreferences = {
        consent: {
          essential: essentialCookies,
          analytics: analyticsCookies,
          marketing: marketingCookies,
        },
        locale: navigator.language || 'en-US',
        preferredLanguage:localStorage.getItem('preferredLanguage'),
        timezone,
        consentDate: moment().tz(timezone).format(),
        theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        deviceType: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        browser: navigator.userAgent,
        accessibilitySettings: {
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          highContrast: window.matchMedia('(prefers-contrast: high)').matches
        }
      };

      const response = await coockieApi.sendCoockies(userPreferences);
      localStorage.setItem('userPreferences', JSON.stringify(response.data.data));
      setOpen(false);
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
    <DrawerContent>
      <div className="mx-auto w-full max-w-sm">
        <DrawerHeader className="text-center">
          <DrawerTitle>Cookie Preferences</DrawerTitle>
          <DrawerDescription>
            We use cookies to improve your experience. Please select your cookie preferences below.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="essential">Essential Cookies</Label>
              <p className="text-sm text-muted-foreground">Required for basic site functionality</p>
            </div>
            <Switch id="essential" checked={essentialCookies} onCheckedChange={setEssentialCookies} disabled />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Analytics Cookies</Label>
              <p className="text-sm text-muted-foreground">Help us improve our website</p>
            </div>
            <Switch id="analytics" checked={analyticsCookies} onCheckedChange={setAnalyticsCookies} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing Cookies</Label>
              <p className="text-sm text-muted-foreground">Used for targeted advertising</p>
            </div>
            <Switch id="marketing" checked={marketingCookies} onCheckedChange={setMarketingCookies} />
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={handleConsent} className="w-full">Save Preferences</Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
  );
};

export default CookieConsent;