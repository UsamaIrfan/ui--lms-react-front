"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-title-h6 text-text-strong-950">{title}</h2>
      <div className="rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-6">
        {children}
      </div>
    </section>
  );
}

function Swatch({
  name,
  bg,
  textClass,
}: {
  name: string;
  bg: string;
  textClass?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-10 w-10 rounded-md border border-stroke-soft-200 ${bg}`}
      />
      <span
        className={`text-[10px] leading-tight ${textClass ?? "text-text-sub-600"}`}
      >
        {name}
      </span>
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function ShowcaseContent() {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      {/* ---- Header ---- */}
      <div>
        <h1 className="text-title-h3 text-text-strong-950">
          LMS Design System
        </h1>
        <p className="mt-2 text-paragraph-md text-text-sub-600">
          AlignUI v1.2 tokens with Tailwind CSS v4. Color palette, typography
          specimen, and component reference.
        </p>
      </div>

      <Separator />

      {/* ================================================================ */}
      {/*  1. COLOR PALETTE                                                */}
      {/* ================================================================ */}
      <div id="colors" className="space-y-10">
        <h2 className="text-title-h4 text-text-strong-950">
          1 &mdash; Color Palette
        </h2>

        {/* Gray */}
        <Section title="Gray (Base)">
          <div className="flex flex-wrap gap-3">
            <Swatch name="0" bg="bg-gray-0" />
            <Swatch name="50" bg="bg-gray-50" />
            <Swatch name="100" bg="bg-gray-100" />
            <Swatch name="200" bg="bg-gray-200" />
            <Swatch name="300" bg="bg-gray-300" />
            <Swatch name="400" bg="bg-gray-400" />
            <Swatch name="500" bg="bg-gray-500" />
            <Swatch name="600" bg="bg-gray-600" />
            <Swatch name="700" bg="bg-gray-700" />
            <Swatch name="800" bg="bg-gray-800" />
            <Swatch name="900" bg="bg-gray-900" />
            <Swatch name="950" bg="bg-gray-950" />
          </div>
        </Section>

        {/* Blue (Primary) */}
        <Section title="Blue (Primary)">
          <div className="flex flex-wrap gap-3">
            <Swatch name="50" bg="bg-blue-50" />
            <Swatch name="100" bg="bg-blue-100" />
            <Swatch name="200" bg="bg-blue-200" />
            <Swatch name="300" bg="bg-blue-300" />
            <Swatch name="400" bg="bg-blue-400" />
            <Swatch name="500" bg="bg-blue-500" />
            <Swatch name="600" bg="bg-blue-600" />
            <Swatch name="700" bg="bg-blue-700" />
            <Swatch name="800" bg="bg-blue-800" />
            <Swatch name="900" bg="bg-blue-900" />
            <Swatch name="950" bg="bg-blue-950" />
          </div>
        </Section>

        {/* Red (Error) */}
        <Section title="Red (Error / Destructive)">
          <div className="flex flex-wrap gap-3">
            <Swatch name="50" bg="bg-red-50" />
            <Swatch name="100" bg="bg-red-100" />
            <Swatch name="200" bg="bg-red-200" />
            <Swatch name="300" bg="bg-red-300" />
            <Swatch name="400" bg="bg-red-400" />
            <Swatch name="500" bg="bg-red-500" />
            <Swatch name="600" bg="bg-red-600" />
            <Swatch name="700" bg="bg-red-700" />
            <Swatch name="800" bg="bg-red-800" />
            <Swatch name="900" bg="bg-red-900" />
            <Swatch name="950" bg="bg-red-950" />
          </div>
        </Section>

        {/* Green (Success) */}
        <Section title="Green (Success)">
          <div className="flex flex-wrap gap-3">
            <Swatch name="50" bg="bg-green-50" />
            <Swatch name="100" bg="bg-green-100" />
            <Swatch name="200" bg="bg-green-200" />
            <Swatch name="300" bg="bg-green-300" />
            <Swatch name="400" bg="bg-green-400" />
            <Swatch name="500" bg="bg-green-500" />
            <Swatch name="600" bg="bg-green-600" />
            <Swatch name="700" bg="bg-green-700" />
            <Swatch name="800" bg="bg-green-800" />
            <Swatch name="900" bg="bg-green-900" />
            <Swatch name="950" bg="bg-green-950" />
          </div>
        </Section>

        {/* Yellow (Warning) */}
        <Section title="Yellow (Warning)">
          <div className="flex flex-wrap gap-3">
            <Swatch name="50" bg="bg-yellow-50" />
            <Swatch name="100" bg="bg-yellow-100" />
            <Swatch name="200" bg="bg-yellow-200" />
            <Swatch name="300" bg="bg-yellow-300" />
            <Swatch name="400" bg="bg-yellow-400" />
            <Swatch name="500" bg="bg-yellow-500" />
            <Swatch name="600" bg="bg-yellow-600" />
            <Swatch name="700" bg="bg-yellow-700" />
            <Swatch name="800" bg="bg-yellow-800" />
            <Swatch name="900" bg="bg-yellow-900" />
            <Swatch name="950" bg="bg-yellow-950" />
          </div>
        </Section>

        {/* Additional scales */}
        <Section title="Orange / Purple / Sky / Pink / Teal">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-label-sm text-text-sub-600">Orange</p>
              <div className="flex flex-wrap gap-3">
                <Swatch name="50" bg="bg-orange-50" />
                <Swatch name="300" bg="bg-orange-300" />
                <Swatch name="500" bg="bg-orange-500" />
                <Swatch name="700" bg="bg-orange-700" />
                <Swatch name="950" bg="bg-orange-950" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-label-sm text-text-sub-600">Purple</p>
              <div className="flex flex-wrap gap-3">
                <Swatch name="50" bg="bg-purple-50" />
                <Swatch name="300" bg="bg-purple-300" />
                <Swatch name="500" bg="bg-purple-500" />
                <Swatch name="700" bg="bg-purple-700" />
                <Swatch name="950" bg="bg-purple-950" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-label-sm text-text-sub-600">Sky</p>
              <div className="flex flex-wrap gap-3">
                <Swatch name="50" bg="bg-sky-50" />
                <Swatch name="300" bg="bg-sky-300" />
                <Swatch name="500" bg="bg-sky-500" />
                <Swatch name="700" bg="bg-sky-700" />
                <Swatch name="950" bg="bg-sky-950" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-label-sm text-text-sub-600">Pink</p>
              <div className="flex flex-wrap gap-3">
                <Swatch name="50" bg="bg-pink-50" />
                <Swatch name="300" bg="bg-pink-300" />
                <Swatch name="500" bg="bg-pink-500" />
                <Swatch name="700" bg="bg-pink-700" />
                <Swatch name="950" bg="bg-pink-950" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-label-sm text-text-sub-600">Teal</p>
              <div className="flex flex-wrap gap-3">
                <Swatch name="50" bg="bg-teal-50" />
                <Swatch name="300" bg="bg-teal-300" />
                <Swatch name="500" bg="bg-teal-500" />
                <Swatch name="700" bg="bg-teal-700" />
                <Swatch name="950" bg="bg-teal-950" />
              </div>
            </div>
          </div>
        </Section>

        {/* Semantic Colors */}
        <Section title="Semantic Colors">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Background */}
            <div>
              <p className="mb-2 text-label-sm text-text-sub-600">Background</p>
              <div className="flex flex-wrap gap-2">
                <Swatch name="white-0" bg="bg-bg-white-0" />
                <Swatch name="weak-50" bg="bg-bg-weak-50" />
                <Swatch name="soft-200" bg="bg-bg-soft-200" />
                <Swatch name="sub-300" bg="bg-bg-sub-300" />
                <Swatch name="surface-800" bg="bg-bg-surface-800" />
                <Swatch name="strong-950" bg="bg-bg-strong-950" />
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="mb-2 text-label-sm text-text-sub-600">Text</p>
              <div className="space-y-1">
                <p className="text-text-strong-950">strong-950</p>
                <p className="text-text-sub-600">sub-600</p>
                <p className="text-text-soft-400">soft-400</p>
                <p className="text-text-disabled-300">disabled-300</p>
                <p className="bg-gray-900 px-2 text-text-white-0">white-0</p>
              </div>
            </div>

            {/* Stroke */}
            <div>
              <p className="mb-2 text-label-sm text-text-sub-600">
                Stroke / Border
              </p>
              <div className="space-y-2">
                <div className="rounded border border-stroke-strong-950 px-2 py-1 text-[11px]">
                  strong-950
                </div>
                <div className="rounded border border-stroke-sub-300 px-2 py-1 text-[11px]">
                  sub-300
                </div>
                <div className="rounded border border-stroke-soft-200 px-2 py-1 text-[11px]">
                  soft-200
                </div>
              </div>
            </div>

            {/* Primary */}
            <div>
              <p className="mb-2 text-label-sm text-text-sub-600">Primary</p>
              <div className="flex flex-wrap gap-2">
                <Swatch name="base" bg="bg-primary-base" />
                <Swatch name="dark" bg="bg-primary-dark" />
                <Swatch name="darker" bg="bg-primary-darker" />
              </div>
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <p className="mb-2 text-label-sm text-text-sub-600">Status</p>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                {(
                  [
                    ["Error", "bg-error-base"],
                    ["Success", "bg-success-base"],
                    ["Warning", "bg-warning-base"],
                    ["Info", "bg-information-base"],
                    ["Feature", "bg-feature-base"],
                  ] as const
                ).map(([label, cls]) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className={`h-8 w-8 rounded-md ${cls}`} />
                    <span className="text-text-sub-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Separator />

      {/* ================================================================ */}
      {/*  2. TYPOGRAPHY SPECIMEN                                          */}
      {/* ================================================================ */}
      <div id="typography" className="space-y-10">
        <h2 className="text-title-h4 text-text-strong-950">
          2 &mdash; Typography Specimen
        </h2>

        {/* Titles */}
        <Section title="Titles">
          <div className="space-y-4">
            <p className="text-title-h1">Title H1 &mdash; 3.5 rem / 64 px</p>
            <p className="text-title-h2">Title H2 &mdash; 2.5 rem / 40 px</p>
            <p className="text-title-h3">Title H3 &mdash; 2 rem / 32 px</p>
            <p className="text-title-h4">Title H4 &mdash; 1.75 rem / 28 px</p>
            <p className="text-title-h5">Title H5 &mdash; 1.5 rem / 24 px</p>
            <p className="text-title-h6">Title H6 &mdash; 1.25 rem / 20 px</p>
          </div>
        </Section>

        {/* Labels */}
        <Section title="Labels (medium weight)">
          <div className="space-y-3">
            <p className="text-label-xl">Label XL &mdash; 1.5 rem / 24 px</p>
            <p className="text-label-lg">Label LG &mdash; 1.125 rem / 18 px</p>
            <p className="text-label-md">Label MD &mdash; 1 rem / 16 px</p>
            <p className="text-label-sm">Label SM &mdash; 0.875 rem / 14 px</p>
            <p className="text-label-xs">Label XS &mdash; 0.75 rem / 12 px</p>
          </div>
        </Section>

        {/* Paragraphs */}
        <Section title="Paragraphs (regular weight)">
          <div className="space-y-3">
            <p className="text-paragraph-xl">
              Paragraph XL &mdash; The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-paragraph-lg">
              Paragraph LG &mdash; The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-paragraph-md">
              Paragraph MD &mdash; The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-paragraph-sm">
              Paragraph SM &mdash; The quick brown fox jumps over the lazy dog.
            </p>
            <p className="text-paragraph-xs">
              Paragraph XS &mdash; The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </Section>

        {/* Subheadings */}
        <Section title="Subheadings (uppercase tracking)">
          <div className="space-y-3">
            <p className="text-subheading-md uppercase">Subheading MD</p>
            <p className="text-subheading-sm uppercase">Subheading SM</p>
            <p className="text-subheading-xs uppercase">Subheading XS</p>
            <p className="text-subheading-2xs uppercase">Subheading 2XS</p>
          </div>
        </Section>

        {/* Doc styles */}
        <Section title="Doc Label &amp; Doc Paragraph">
          <p className="text-doc-label">
            Doc Label &mdash; 1 rem, 700 weight, tight tracking
          </p>
          <p className="text-doc-paragraph mt-2">
            Doc Paragraph &mdash; 1 rem, 400 weight, normal tracking, generous
            line-height (1.75 rem).
          </p>
        </Section>
      </div>

      <Separator />

      {/* ================================================================ */}
      {/*  3. COMPONENT EXAMPLES                                           */}
      {/* ================================================================ */}
      <div id="components" className="space-y-10">
        <h2 className="text-title-h4 text-text-strong-950">
          3 &mdash; Component Examples
        </h2>

        {/* Button */}
        <Section title="Button">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        {/* Input */}
        <Section title="Input">
          <div className="grid max-w-sm gap-4">
            <div>
              <Label htmlFor="input-default">Default Input</Label>
              <Input id="input-default" placeholder="Type something..." />
            </div>
            <div>
              <Label htmlFor="input-disabled">Disabled Input</Label>
              <Input
                id="input-disabled"
                placeholder="Disabled"
                disabled
                value="Cannot edit"
              />
            </div>
          </div>
        </Section>

        {/* Textarea */}
        <Section title="Textarea">
          <div className="max-w-sm">
            <Label htmlFor="textarea-demo">Message</Label>
            <Textarea
              id="textarea-demo"
              placeholder="Write your message here..."
            />
          </div>
        </Section>

        {/* Checkbox */}
        <Section title="Checkbox">
          <div className="flex items-center gap-2">
            <Checkbox
              id="checkbox-demo"
              checked={checkboxChecked}
              onCheckedChange={(checked) =>
                setCheckboxChecked(checked === true)
              }
            />
            <Label htmlFor="checkbox-demo">
              Accept terms and conditions
              {checkboxChecked ? " ✓" : ""}
            </Label>
          </div>
        </Section>

        {/* Radio Group */}
        <Section title="Radio Group">
          <RadioGroup defaultValue="option-1">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="option-1" id="radio-1" />
              <Label htmlFor="radio-1">Option One</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="option-2" id="radio-2" />
              <Label htmlFor="radio-2">Option Two</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="option-3" id="radio-3" />
              <Label htmlFor="radio-3">Option Three</Label>
            </div>
          </RadioGroup>
        </Section>

        {/* Switch */}
        <Section title="Switch">
          <div className="flex items-center gap-2">
            <Switch
              id="switch-demo"
              checked={switchChecked}
              onCheckedChange={setSwitchChecked}
            />
            <Label htmlFor="switch-demo">
              Airplane Mode: {switchChecked ? "On" : "Off"}
            </Label>
          </div>
        </Section>

        {/* Select */}
        <Section title="Select">
          <div className="max-w-sm">
            <Label>Choose a fruit</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a fruit..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="cherry">Cherry</SelectItem>
                <SelectItem value="grape">Grape</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        {/* Badge */}
        <Section title="Badge">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        {/* Avatar */}
        <Section title="Avatar">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="User avatar"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </Section>

        {/* Separator */}
        <Section title="Separator">
          <div className="space-y-4">
            <p className="text-paragraph-sm text-text-sub-600">
              Content above separator
            </p>
            <Separator />
            <p className="text-paragraph-sm text-text-sub-600">
              Content below separator
            </p>
            <div className="flex h-8 items-center gap-4">
              <span className="text-paragraph-sm">Left</span>
              <Separator orientation="vertical" />
              <span className="text-paragraph-sm">Center</span>
              <Separator orientation="vertical" />
              <span className="text-paragraph-sm">Right</span>
            </div>
          </div>
        </Section>

        {/* Spinner */}
        <Section title="Spinner">
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Section>

        {/* Card */}
        <Section title="Card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-paragraph-sm text-text-sub-600">
                  This is a card with a header and content area.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-paragraph-sm text-text-sub-600">
                  Cards are perfect for grouping related content.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Tooltip */}
        <Section title="Tooltip">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a tooltip</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Section>

        {/* Dialog */}
        <Section title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  Dialogs are used for important interactions that require user
                  attention.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-paragraph-sm text-text-sub-600">
                  Dialog body content here.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        {/* Dropdown Menu */}
        <Section title="Dropdown Menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        {/* Popover */}
        <Section title="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <h4 className="text-label-sm">Dimensions</h4>
                <p className="text-paragraph-sm text-text-sub-600">
                  Set the dimensions for the layer.
                </p>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      defaultValue="100%"
                      className="col-span-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      defaultValue="25px"
                      className="col-span-2"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </Section>

        {/* Table */}
        <Section title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">John Doe</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>
                  <Badge variant="default">Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jane Smith</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>
                  <Badge variant="secondary">Inactive</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Bob Wilson</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>
                  <Badge variant="outline">Pending</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>
      </div>

      <Separator />

      {/* ================================================================ */}
      {/*  4. SHADOWS                                                      */}
      {/* ================================================================ */}
      <div id="shadows" className="space-y-10">
        <h2 className="text-title-h4 text-text-strong-950">
          4 &mdash; Shadows
        </h2>
        <Section title="Shadow Scale">
          <div className="flex flex-wrap gap-6">
            {(
              [
                ["XS", "shadow-xs"],
                ["SM", "shadow-sm"],
                ["MD", "shadow-md"],
                ["Tooltip", "shadow-tooltip"],
              ] as const
            ).map(([label, cls]) => (
              <div
                key={label}
                className={`flex h-20 w-28 items-center justify-center rounded-lg bg-bg-white-0 ${cls}`}
              >
                <span className="text-label-xs text-text-sub-600">{label}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Separator />

      {/* ================================================================ */}
      {/*  5. DESIGN TOKEN REFERENCE                                       */}
      {/* ================================================================ */}
      <div id="tokens" className="space-y-10">
        <h2 className="text-title-h4 text-text-strong-950">
          5 &mdash; Quick Token Reference
        </h2>
        <Section title="CSS Variable to Tailwind Utility Mapping">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-paragraph-sm">
              <thead>
                <tr className="border-b border-stroke-soft-200">
                  <th className="pb-2 pr-6 text-label-sm text-text-sub-600">
                    CSS Variable
                  </th>
                  <th className="pb-2 pr-6 text-label-sm text-text-sub-600">
                    Tailwind Class
                  </th>
                  <th className="pb-2 text-label-sm text-text-sub-600">
                    Usage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-soft-200">
                {[
                  [
                    "--primary-base",
                    "bg-primary-base / text-primary-base",
                    "Primary actions, links",
                  ],
                  [
                    "--error-base",
                    "text-error-base / bg-error-base",
                    "Validation errors, destructive actions",
                  ],
                  [
                    "--success-base",
                    "text-success-base / bg-success-base",
                    "Success feedback",
                  ],
                  [
                    "--warning-base",
                    "text-warning-base / bg-warning-base",
                    "Warning alerts",
                  ],
                  ["--bg-white-0", "bg-bg-white-0", "Page / card backgrounds"],
                  [
                    "--bg-weak-50",
                    "bg-bg-weak-50",
                    "Hover / subtle highlights",
                  ],
                  [
                    "--text-strong-950",
                    "text-text-strong-950",
                    "Primary body text",
                  ],
                  [
                    "--text-sub-600",
                    "text-text-sub-600",
                    "Secondary / helper text",
                  ],
                  [
                    "--text-soft-400",
                    "text-text-soft-400",
                    "Placeholder / muted text",
                  ],
                  [
                    "--stroke-soft-200",
                    "border-stroke-soft-200",
                    "Default borders",
                  ],
                  [
                    "--static-white",
                    "text-static-white / bg-static-white",
                    "Text on colored backgrounds",
                  ],
                ].map(([variable, cls, usage]) => (
                  <tr key={variable}>
                    <td className="py-2 pr-6 font-mono text-[13px]">
                      {variable}
                    </td>
                    <td className="py-2 pr-6 font-mono text-[13px] text-primary-base">
                      {cls}
                    </td>
                    <td className="py-2 text-text-sub-600">{usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <Separator />

      <footer className="pb-8 text-center text-paragraph-sm text-text-soft-400">
        LMS Design System &mdash; AlignUI v1.2 + Tailwind CSS v4
      </footer>
    </div>
  );
}
