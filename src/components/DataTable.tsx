"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox"; // Removed due to missing module
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Mock Data
const mockOrders = [
  {
    id: "PSD25090013",
    name: "Blue's Order",
    date: "09/09/2025",
    orderedDate: "04/09/2025",
    accountName: "Schwing Stetter Demo",
    totalItems: 1,
    subtotal: "INR ₹61,728.00",
    status: "completed",
  },
  {
    id: "P3961525090002",
    name: "Blue's Order",
    date: "09/09/2025",
    orderedDate: "03/09/2025",
    accountName: "JB Customer",
    totalItems: 1,
    subtotal: "INR ₹1,23,456.00",
    status: "pending",
  },
  {
    id: "P3961525090003",
    name: "Jb order",
    date: "09/09/2025",
    orderedDate: "03/09/2025",
    accountName: "JB Customer",
    totalItems: 1,
    subtotal: "INR ₹1,23,456.00",
    status: "processing",
  },
  {
    id: "P3961525080003",
    name: "Blue's Order",
    date: "02/09/2025",
    orderedDate: "30/08/2025",
    accountName: "JB Customer",
    totalItems: 1,
    subtotal: "INR ₹1,23,456.00",
    status: "completed",
  },
  {
    id: "PSD25090002",
    name: "Blue's Order",
    date: "01/09/2025",
    orderedDate: "01/09/2025",
    accountName: "Schwing Stetter Demo",
    totalItems: 1,
    subtotal: "INR ₹61,728.00",
    status: "cancelled",
  },
];

// Column Definitions
const columnDefinitions = [
  { id: "id", header: "Order Id", accessor: "id" },
  { id: "name", header: "Name", accessor: "name" },
  { id: "date", header: "Date", accessor: "date" },
  { id: "orderedDate", header: "Ordered Date", accessor: "orderedDate" },
  { id: "accountName", header: "Account Name", accessor: "accountName" },
  { id: "totalItems", header: "Total Items", accessor: "totalItems" },
  { id: "subtotal", header: "Subtotal", accessor: "subtotal" },
  { id: "status", header: "Status", accessor: "status" },
];

export default function DataTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState(
    columnDefinitions.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );
  const [columnOrder, setColumnOrder] = useState(
    columnDefinitions.map(col => col.id)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return mockOrders;
    return mockOrders.filter(order =>
      Object.values(order).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(sortedData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (rowId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, rowId]);
    } else {
      setSelectedRows(selectedRows.filter(id => id !== rowId));
    }
  };

  const handleColumnToggle = (columnId: string, checked: boolean) => {
    setVisibleColumns({ ...visibleColumns, [columnId]: checked });
  };

  // Get ordered columns based on current order state
  const getOrderedColumns = () => {
    return columnOrder
      .map(id => columnDefinitions.find(col => col.id === id))
      .filter(
        (col): col is (typeof columnDefinitions)[number] => col !== undefined
      );
  };

  // Drag and drop handlers
  const handleDragStart = (columnId: string) => {
    setDraggedItem(columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetColumnId) return;

    const newColumnOrder = [...columnOrder];
    const draggedIndex = newColumnOrder.indexOf(draggedItem);
    const targetIndex = newColumnOrder.indexOf(targetColumnId);

    // Remove dragged item and insert at target position
    newColumnOrder.splice(draggedIndex, 1);
    newColumnOrder.splice(targetIndex, 0, draggedItem);

    setColumnOrder(newColumnOrder);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={
          statusColors[status as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex gap-6 p-6">
      {/* Main Table */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Orders (105)</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  EXPORT
                </Button>
                <Button variant="outline" size="sm">
                  ALL
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRows.length === sortedData.length}
                        onCheckedChange={handleSelectAll}
                        {...(selectedRows.length > 0 &&
                        selectedRows.length < sortedData.length
                          ? { indeterminate: true }
                          : {})}
                      />
                    </TableHead>
                    {getOrderedColumns()
                      .filter(
                        col =>
                          visibleColumns &&
                          visibleColumns.hasOwnProperty(col.id) &&
                          visibleColumns[col.id as keyof typeof visibleColumns]
                      )
                      .map(column => (
                        <TableHead key={column.id}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-semibold"
                            onClick={() => handleSort(column.accessor)}
                          >
                            {column.header}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map(order => (
                    <TableRow
                      key={order.id}
                      className={
                        selectedRows.includes(order.id) ? "bg-muted/50" : ""
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(order.id)}
                          onCheckedChange={checked =>
                            handleRowSelect(order.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      {getOrderedColumns()
                        .filter(
                          col =>
                            visibleColumns &&
                            visibleColumns.hasOwnProperty(col.id) &&
                            visibleColumns[
                              col.id as keyof typeof visibleColumns
                            ]
                        )
                        .map(column => (
                          <TableCell key={column.id}>
                            {column.accessor === "status" ? (
                              getStatusBadge(
                                order[
                                  column.accessor as keyof typeof order
                                ] as string
                              )
                            ) : column.accessor === "totalItems" ? (
                              <Button
                                variant="link"
                                className="p-0 text-blue-600"
                              >
                                {order[column.accessor as keyof typeof order]}
                              </Button>
                            ) : (
                              order[column.accessor as keyof typeof order]
                            )}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Button variant="outline" size="sm">
                  20
                </Button>
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  1-20 of 105
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column Selector Sidebar */}
      <div className="w-80">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Columns</CardTitle>
              <Settings className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {getOrderedColumns().map(column => (
              <div
                key={column.id}
                className={`flex items-center space-x-3 p-2 rounded cursor-move transition-colors ${
                  draggedItem === column.id
                    ? "bg-muted opacity-50"
                    : "hover:bg-muted/50"
                }`}
                draggable
                onDragStart={() => handleDragStart(column.id)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, column.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-3 gap-1 cursor-grab active:cursor-grabbing">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                </div>
                <input
                  type="checkbox"
                  checked={
                    !!visibleColumns?.[column.id as keyof typeof visibleColumns]
                  }
                  onChange={e =>
                    handleColumnToggle(column.id, e.target.checked)
                  }
                  className="form-checkbox h-4 w-4 text-primary"
                />
                <span className="text-sm font-medium">{column.header}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
