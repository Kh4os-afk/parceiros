import { Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export interface FacetOption {
    value: string;
    label: string;
    count?: number;
}

interface FacetedFilterProps {
    title: string;
    options: FacetOption[];
    selected: string[];
    onChange: (values: string[]) => void;
}

export default function FacetedFilter({ title, options, selected, onChange }: FacetedFilterProps) {
    const selectedSet = new Set(selected);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-none border-dashed text-xs gap-1.5"
                >
                    <PlusCircle className="h-3.5 w-3.5" />
                    {title}
                    {selectedSet.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-1 h-4" />
                            <span className="hidden lg:inline-flex items-center gap-1">
                                {selectedSet.size > 2 ? (
                                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium">
                                        {selectedSet.size} selecionados
                                    </span>
                                ) : (
                                    options
                                        .filter((o) => selectedSet.has(o.value))
                                        .map((o) => (
                                            <span
                                                key={o.value}
                                                className="rounded-sm bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium"
                                            >
                                                {o.label}
                                            </span>
                                        ))
                                )}
                            </span>
                            <span className="lg:hidden rounded-sm bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium">
                                {selectedSet.size}
                            </span>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0 rounded-none bg-white" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList>
                        <CommandEmpty>Nenhum resultado.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selectedSet.has(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            const next = new Set(selectedSet);
                                            if (isSelected) next.delete(option.value);
                                            else next.add(option.value);
                                            onChange(Array.from(next));
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className="h-3 w-3" />
                                        </div>
                                        <span className="flex-1">{option.label}</span>
                                        {option.count !== undefined && (
                                            <span className="ml-auto font-mono text-xs text-muted-foreground">
                                                {option.count}
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selectedSet.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => onChange([])}
                                        className="justify-center text-center"
                                    >
                                        Limpar filtros
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
