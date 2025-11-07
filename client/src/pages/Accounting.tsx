import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Plus, FileText, Filter, DollarSign, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionSchema, type Transaction } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const formSchema = insertTransactionSchema.extend({
  transactionDate: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Accounting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest("/api/transactions", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setOpenDialog(false);
      toast({
        title: "Transacción creada",
        description: "La transacción se ha registrado correctamente",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la transacción",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "gasto",
      category: "mantenimiento",
      amount: "0",
      description: "",
      transactionDate: new Date().toISOString().split('T')[0],
      communityId: user?.communityId || "",
      createdById: user?.id || "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const filteredTransactions = transactions?.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    return true;
  });

  const totalIngresos = transactions
    ?.filter((t) => t.type === "ingreso")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  const totalGastos = transactions
    ?.filter((t) => t.type === "gasto")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  const balance = totalIngresos - totalGastos;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      mantenimiento: "Mantenimiento",
      reparacion: "Reparación",
      suministros: "Suministros",
      limpieza: "Limpieza",
      administracion: "Administración",
      seguro: "Seguro",
      cuota_mensual: "Cuota Mensual",
      derrama: "Derrama",
      otro: "Otro",
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Contabilidad</h1>
          <p className="text-muted-foreground">Gestión financiera de la comunidad</p>
        </div>
        {user?.role === "presidente" && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-transaction">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Transacción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Transacción</DialogTitle>
                <DialogDescription>
                  Añade un nuevo movimiento económico a la comunidad
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-type">
                                <SelectValue placeholder="Selecciona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gasto">Gasto</SelectItem>
                              <SelectItem value="ingreso">Ingreso</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Selecciona categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                              <SelectItem value="reparacion">Reparación</SelectItem>
                              <SelectItem value="suministros">Suministros</SelectItem>
                              <SelectItem value="limpieza">Limpieza</SelectItem>
                              <SelectItem value="administracion">Administración</SelectItem>
                              <SelectItem value="seguro">Seguro</SelectItem>
                              <SelectItem value="cuota_mensual">Cuota Mensual</SelectItem>
                              <SelectItem value="derrama">Derrama</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Importe (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              data-testid="input-amount"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transactionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              data-testid="input-date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe la transacción..."
                            data-testid="input-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notas adicionales..."
                            data-testid="input-notes"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                      {createMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="w-4 h-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2" data-testid="text-total-ingresos">
              {totalIngresos.toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cuotas y otros ingresos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-total-gastos">
              {totalGastos.toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mantenimiento y servicios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-chart-2" : "text-destructive"
              }`}
              data-testid="text-balance"
            >
              {balance.toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance >= 0 ? "Saldo positivo" : "Saldo negativo"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Movimientos</CardTitle>
              <CardDescription>Historial de transacciones de la comunidad</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-type-filter">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="gasto">Gastos</SelectItem>
                  <SelectItem value="ingreso">Ingresos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="reparacion">Reparación</SelectItem>
                  <SelectItem value="suministros">Suministros</SelectItem>
                  <SelectItem value="limpieza">Limpieza</SelectItem>
                  <SelectItem value="administracion">Administración</SelectItem>
                  <SelectItem value="seguro">Seguro</SelectItem>
                  <SelectItem value="cuota_mensual">Cuota Mensual</SelectItem>
                  <SelectItem value="derrama">Derrama</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Importe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay transacciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions?.map((transaction) => (
                  <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                    <TableCell data-testid={`text-date-${transaction.id}`}>
                      {format(new Date(transaction.transactionDate), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.type === "ingreso" ? "default" : "secondary"}
                        data-testid={`badge-type-${transaction.id}`}
                      >
                        {transaction.type === "ingreso" ? "Ingreso" : "Gasto"}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-category-${transaction.id}`}>
                      {getCategoryLabel(transaction.category)}
                    </TableCell>
                    <TableCell data-testid={`text-description-${transaction.id}`}>
                      {transaction.description}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.type === "ingreso" ? "text-chart-2" : "text-destructive"
                      }`}
                      data-testid={`text-amount-${transaction.id}`}
                    >
                      {transaction.type === "ingreso" ? "+" : "-"}
                      {parseFloat(transaction.amount).toFixed(2)} €
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
