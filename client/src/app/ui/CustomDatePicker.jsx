import React from 'react';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/ui/popover"
import { format } from "date-fns"

const CustomDatePicker = ({ label, value, onValueChange }) => {
  const formattedDate = value ? format(new Date(value), "yyyy-MM-dd") : '';

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    onValueChange(newDate);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${!value && "text-muted-foreground"}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Input
            type="date"
            id={label}
            className="w-full"
            value={formattedDate}
            onChange={handleDateChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomDatePicker;