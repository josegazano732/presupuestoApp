import { Component, OnInit } from '@angular/core';
import { BudgetItem } from '../models/budget-item';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-budget-calculator',
  templateUrl: './budget-calculator.component.html',
  styleUrls: ['./budget-calculator.component.scss']
})
export class BudgetCalculatorComponent implements OnInit {
  displayedColumns: string[] = ['id', 'description', 'unit', 'quantity', 'unitPrice', 'subtotal', 'actions'];
  
  availableUnits: string[] = [
    'metro',
    'unidad',
    'caja',
    'combo',
    'm²',
    'jornada',
    'viaje',
    'kg',
    'litro',
    'hora'
  ];

  budgetItems: BudgetItem[] = [
    { id: 1, description: 'Perfilería (montantes y soleras)', unit: 'metro', quantity: 25, unitPrice: 11500, subtotal: 287500 },
    { id: 2, description: 'Placas de yeso (Durlock, etc.)', unit: 'unidad', quantity: 2, unitPrice: 20, subtotal: 40 },
    { id: 3, description: 'Tornillos', unit: 'caja', quantity: 15, unitPrice: 4, subtotal: 60 },
    { id: 4, description: 'Masilla y cinta para juntas', unit: 'combo', quantity: 0, unitPrice: 0, subtotal: 0 },
    { id: 5, description: 'Lana de vidrio (aislación)', unit: 'm²', quantity: 0, unitPrice: 0, subtotal: 0 },
    { id: 6, description: 'Mano de obra', unit: 'jornada', quantity: 0, unitPrice: 0, subtotal: 0 },
    { id: 7, description: 'Transporte de materiales', unit: 'viaje', quantity: 0, unitPrice: 0, subtotal: 0 }
  ];

  total: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.calculateTotal();
  }

  addNewItem(): void {
    const newId = Math.max(...this.budgetItems.map(item => item.id)) + 1;
    this.budgetItems.push({
      id: newId,
      description: '',
      unit: 'unidad',
      quantity: 1,
      unitPrice: 0,
      subtotal: 0
    });
    this.calculateSubtotal(this.budgetItems[this.budgetItems.length - 1]);
  }

  removeItem(item: BudgetItem): void {
    const index = this.budgetItems.indexOf(item);
    if (index >= 0 && this.budgetItems.length > 1) {
      this.budgetItems.splice(index, 1);
      this.reorderItems();
      this.calculateTotal();
    }
  }

  reorderItems(): void {
    this.budgetItems.forEach((item, index) => {
      item.id = index + 1;
    });
  }

  calculateSubtotal(item: BudgetItem): void {
    item.subtotal = item.quantity * item.unitPrice;
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total = this.budgetItems.reduce((acc, item) => acc + item.subtotal, 0);
  }

  resetItem(item: BudgetItem): void {
    item.description = '';
    item.unit = 'unidad';
    item.quantity = 1;
    item.unitPrice = 0;
    this.calculateSubtotal(item);
  }

  generatePDF(): void {
    // Crear documento A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configuración de medidas A4
    const pageWidth = 210;  // Ancho A4 en mm
    const pageHeight = 297; // Alto A4 en mm
    const margin = 20;      // Margen de 20mm
    const contentWidth = pageWidth - (margin * 2);

    // Encabezado
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('PRESUPUESTO', margin, 25);

    // Información de fecha
    const date = new Date().toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Fecha: ${date}`, pageWidth - margin - doc.getTextWidth(`Fecha: ${date}`), 25);

    // Información del documento
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(10);
    const documentInfo = 'Presupuesto Estimativo';
    doc.text(documentInfo, margin, 50);

    // Configuración de la tabla
    const tableColumn = ['N°', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', 'Subtotal'];
    const tableRows: any[] = [];

    this.budgetItems.forEach(item => {
      const itemData = [
        item.id,
        item.description || '-',
        item.unit,
        item.quantity.toLocaleString(),
        `$ ${item.unitPrice.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
        `$ ${item.subtotal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
      ];
      tableRows.push(itemData);
    });

    // Configuración optimizada para A4
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      foot: [[
        { content: 'TOTAL', colSpan: 5, styles: { halign: 'right', fillColor: [240, 240, 240], fontSize: 10, fontStyle: 'bold' } },
        { content: `$ ${this.total.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
          styles: { halign: 'right', fillColor: [240, 240, 240], fontSize: 10, fontStyle: 'bold' } }
      ]],
      startY: 60,
      margin: { top: margin, right: margin, bottom: margin, left: margin },
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        font: 'helvetica',
        valign: 'middle',
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
        cellPadding: { top: 6, right: 3, bottom: 6, left: 3 },
        minCellHeight: 14,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'normal' },
        1: { cellWidth: contentWidth * 0.35, halign: 'left', fontStyle: 'normal' },
        2: { cellWidth: contentWidth * 0.12, halign: 'center', fontStyle: 'normal' },
        3: { cellWidth: contentWidth * 0.12, halign: 'right', fontStyle: 'normal' },
        4: { cellWidth: contentWidth * 0.18, halign: 'right', fontStyle: 'normal' },
        5: { cellWidth: contentWidth * 0.18, halign: 'right', fontStyle: 'normal' }
      },
      footStyles: {
        fontSize: 10,
        textColor: 0,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
        halign: 'right'
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      bodyStyles: {
        lineColor: [200, 200, 200]
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          data.cell.styles.minCellHeight = 14;
        }
      },
      didDrawCell: (data) => {
        if (data.section === 'head') {
          const { x, y, width, height } = data.cell;
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.1);
          doc.line(x, y, x + width, y);
          doc.line(x, y + height, x + width, y + height);
        }
      },
    });

    // Pie de página
    const pageCount = doc.internal.pages.length - 1;
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - margin - 20,
        pageHeight - margin
      );
    }

    doc.save(`Presupuesto_${date.replace(/ /g, '_')}.pdf`);
  }
}
