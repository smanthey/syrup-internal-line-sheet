'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react'

type ClientLineSheetItem = {
  id: number
  name: string
  balance: number
  minOrderQuantity: number
  sampleLeadTime: string
  bulkLeadTime: string
  status: string
  sizes: string
  fabricMaterial: string
  category: string
  imageUrl: string
}

export default function ClientLineSheet() {
  const [items, setItems] = useState<ClientLineSheetItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 9

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      Papa.parse<ClientLineSheetItem>(file, {
        complete: (result) => {
          if (result.errors.length > 0) {
            setError("Error parsing CSV file. Please check the file format.")
            return
          }
          const parsedData = result.data.map((row, index) => ({
            id: index + 1,
            name: row.name || '',
            balance: parseFloat(row.balance as string) || 0,
            minOrderQuantity: parseInt(row.minOrderQuantity as string) || 0,
            sampleLeadTime: row.sampleLeadTime || '',
            bulkLeadTime: row.bulkLeadTime || '',
            status: row.status || '',
            sizes: row.sizes || '',
            fabricMaterial: row.fabricMaterial || '',
            category: row.category || '',
            imageUrl: row.imageUrl || ''
          }))
          setItems(parsedData)
          setError(null)
        },
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.toLowerCase().replace(/\s+/g, ''),
      })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "All" || item.status === statusFilter) &&
      (categoryFilter === "All" || item.category === categoryFilter)
    )
  }, [items, searchTerm, statusFilter, categoryFilter])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const categories = useMemo(() => Array.from(new Set(items.map(item => item.category))), [items])
  const statuses = useMemo(() => Array.from(new Set(items.map(item => item.status))), [items])

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {displayedItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover mb-4" />
            <div className="space-y-2">
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Min. Order:</strong> {item.minOrderQuantity} units</p>
              <p><strong>Sample Lead Time:</strong> {item.sampleLeadTime}</p>
              <p><strong>Bulk Lead Time:</strong> {item.bulkLeadTime || 'N/A'}</p>
              <p><strong>Sizes:</strong> {item.sizes}</p>
              <p><strong>Material:</strong> {item.fabricMaterial}</p>
              {item.balance > 0 && (
                <p><strong>Balance Due:</strong> ${item.balance.toFixed(2)}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Badge variant={item.status === "In Production" ? "default" : "secondary"}>
              {item.status}
            </Badge>
            <Button variant="outline">Request Info</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Min. Order</TableHead>
            <TableHead>Sample Lead Time</TableHead>
            <TableHead>Bulk Lead Time</TableHead>
            <TableHead>Sizes</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Balance Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.minOrderQuantity}</TableCell>
              <TableCell>{item.sampleLeadTime}</TableCell>
              <TableCell>{item.bulkLeadTime || 'N/A'}</TableCell>
              <TableCell>{item.sizes}</TableCell>
              <TableCell>{item.fabricMaterial}</TableCell>
              <TableCell>
                <Badge variant={item.status === "In Production" ? "default" : "secondary"}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{item.balance > 0 ? `$${item.balance.toFixed(2)}` : 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Clothing Line Sheet</h1>
      
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV file here ...</p>
        ) : (
          <p>Drag and drop a CSV file here, or click to select a file</p>
        )}
        <Upload className="mx-auto mt-4" size={48} />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={viewMode} onValueChange={(value: 'grid' | 'table') => setViewMode(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid View</SelectItem>
            <SelectItem value="table">Table View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === 'grid' ? renderGridView() : renderTableView()}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} items
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}