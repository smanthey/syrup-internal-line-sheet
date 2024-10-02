'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react'

type InternalLineSheetItem = {
  id: number
  name: string
  minOrderQuantity: number
  sampleCost: number
  productionCost: number
  factoryCost: number
  shipping: string
  sampleLeadTime: string
  bulkLeadTime: string
  status: string
  note: string
  sizes: string
  fabricMaterial: string
  category: string
  imageUrl: string
  alibabaUrl: string
}

export default function InternalLineSheet() {
  const [items, setItems] = useState<InternalLineSheetItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 10

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      Papa.parse<InternalLineSheetItem>(file, {
        complete: (result) => {
          if (result.errors.length > 0) {
            setError("Error parsing CSV file. Please check the file format.")
            return
          }
          const parsedData = result.data.map((row, index) => ({
            id: index + 1,
            name: row.name || '',
            minOrderQuantity: parseInt(row.minOrderQuantity as string) || 0,
            sampleCost: parseFloat(row.sampleCost as string) || 0,
            productionCost: parseFloat(row.productionCost as string) || 0,
            factoryCost: parseFloat(row.factoryCost as string) || 0,
            shipping: row.shipping || '',
            sampleLeadTime: row.sampleLeadTime || '',
            bulkLeadTime: row.bulkLeadTime || '',
            status: row.status || '',
            note: row.note || '',
            sizes: row.sizes || '',
            fabricMaterial: row.fabricMaterial || '',
            category: row.category || '',
            imageUrl: row.imageUrl || '',
            alibabaUrl: row.alibabaUrl || ''
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

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "All" || item.status === statusFilter) &&
    (categoryFilter === "All" || item.category === categoryFilter)
  )

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const categories = Array.from(new Set(items.map(item => item.category)))
  const statuses = Array.from(new Set(items.map(item => item.status)))

  const calculateMargin = (productionCost: number, factoryCost: number) => {
    if (factoryCost === 0) return 0
    return ((productionCost - factoryCost) / factoryCost) * 100
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Internal Clothing Line Sheet</h1>
      
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
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Sample Cost</TableHead>
              <TableHead>Production Cost</TableHead>
              <TableHead>Factory Cost</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Shipping</TableHead>
              <TableHead>Sample Lead Time</TableHead>
              <TableHead>Bulk Lead Time</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Alibaba URL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover" />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "In Production" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.minOrderQuantity}</TableCell>
                <TableCell>${item.sampleCost.toFixed(2)}</TableCell>
                <TableCell>${item.productionCost.toFixed(2)}</TableCell>
                <TableCell>${item.factoryCost.toFixed(2)}</TableCell>
                <TableCell>{calculateMargin(item.productionCost, item.factoryCost).toFixed(2)}%</TableCell>
                <TableCell>{item.shipping}</TableCell>
                <TableCell>{item.sampleLeadTime}</TableCell>
                <TableCell>{item.bulkLeadTime || 'N/A'}</TableCell>
                <TableCell>{item.sizes}</TableCell>
                <TableCell>{item.fabricMaterial}</TableCell>
                <TableCell>{item.note}</TableCell>
                <TableCell>
                  {item.alibabaUrl && (
                    <a href={item.alibabaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Link
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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