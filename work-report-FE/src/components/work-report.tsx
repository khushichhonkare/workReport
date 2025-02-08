"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formatDate = (dateRange: { from: Date; to: Date }) => {
  return {
    from: dayjs(dateRange.from).format("YYYY-MM-DD"),
    to: dayjs(dateRange.to).format("YYYY-MM-DD"),
  };
};

const fetchData = async (params: { from: string; to: string }) => {
  console.log("Fetching data with params:", params);
  // const response = await axios.get("http://localhost:3000/get-report", { params }); // 🔹 Ensure this API exists
  // return response.data;
  return {
    data: '\n{\n  "Completed tasks": [\n    \n  ],\n  "Fixes": [\n    "setup home page",\n    "removed unused files"\n  ],\n  "Pending": []\n}\n',
  };
};

const formatReportData = (data) => {
  let formattedReport = "";

  for (const [heading, points] of Object.entries(data)) {
    formattedReport += `${heading}:\n`;

    if (points.length > 0) {
      points.forEach((point) => {
        formattedReport += `- ${point}\n`;
      });
    } else {
      formattedReport += "- No tasks assigned\n";
    }

    formattedReport += "\n";
  }

  return formattedReport.trim();
};

interface FormData {
  dateRange: {
    from: Date;
    to: Date;
  };
  work_report: string;
}

export function WorkReportForm({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {



  const { handleSubmit, setValue, watch, register} = useForm<FormData>({
    defaultValues: {
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
      work_report: '',
    },
  });

  const getReport = useMutation({
    mutationFn: fetchData, // ✅ Use `mutationFn`
    onSuccess: (data) => {
      const parsedData = JSON.parse(data.data);
      console.log("Success:", parsedData);
      const formattedReport = formatReportData(parsedData);
      setValue("work_report", formattedReport);
      console.log("Formatted Report:", formattedReport);
    },

    onError: (error) => {
      console.error("Error fetching data:", error);
    },
  });

console.log("watch", watch("work_report"));

  const date = watch("dateRange");

  const onSubmit = (data: any) => {
    const formattedData = formatDate(data.dateRange);
    getReport.mutate(formattedData);
  };

  return (
    <>
      <Card
        className={`w-[420px] bg-slate-200 text-slate-700 ${className} mb-4`}
      >
        <CardHeader className="pb-1">
          <CardTitle className="text-center">Work Report</CardTitle>
          <CardDescription className="text-center">
            Select dates for work report
          </CardDescription>
        </CardHeader>
        <Separator className="my-4 bg-slate-400" />
        <CardContent className="pt-2">
          <div className="grid gap-2 w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className="w-full justify-center text-left font-normal"
                >
                  <CalendarIcon />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(range) => setValue("dateRange", range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button variant="outline" className="w-full">
            Cancel
          </Button>
          <Button
            className="w-full bg-slate-900"
            onClick={handleSubmit(onSubmit)}
          >
            {getReport.isLoading ? "Loading..." : "Generate Report"}
          </Button>
        </CardFooter>
      </Card>

      {getReport.isLoading ? (
        "Loading..."
      ) : (
        <div className="grid w-full gap-1.5 pt-4 text-slate-700">
          <Label htmlFor="message-2" className="font-semibold text-lg">
            Your Work Report is Ready to Go!
          </Label>

          <Textarea
            placeholder="Add your personalized message here..."
            {...register("work_report")}
          />

          <p className="text-sm text-muted-foreground">
            Feel free to tweak, copy, and paste it directly into your work
            report sheet.
          </p>
        </div>
      )}
    </>
  );
}
