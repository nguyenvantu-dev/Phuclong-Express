using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;

namespace OrderMan;

public class ExcelUtils
{
	public static string[] GetAllSheet(string filepath)
	{
		try
		{
			using SpreadsheetDocument spreadsheetDocument = SpreadsheetDocument.Open(filepath, isEditable: true);
			Workbook workbook = spreadsheetDocument.WorkbookPart.Workbook;
			string[] array = new string[workbook.Descendants<Sheet>().Count()];
			int num = 0;
			foreach (Sheet item in workbook.Descendants<Sheet>())
			{
				array[num] = item.Name.ToString();
				num++;
			}
			return array;
		}
		catch
		{
			return null;
		}
	}

	public static int GetRowIndex(SharedStringTable sharedStrings, Worksheet workSheet, int columnIndex, string cellValue)
	{
		try
		{
			int num = 0;
			for (num = 0; num < workSheet.Descendants<Row>().Count(); num++)
			{
				Row row = workSheet.Descendants<Row>().ElementAt(num);
				Cell cell = row.Elements<Cell>().ElementAt(columnIndex);
				if (cell.DataType != null && cell.DataType.HasValue && (CellValues)cell.DataType == CellValues.SharedString)
				{
					if (sharedStrings.ChildElements[int.Parse(cell.CellValue.InnerText)].InnerText == cellValue)
					{
						return (int)row.RowIndex.Value;
					}
				}
				else if (cell.CellValue != null && cell.CellValue.InnerText == cellValue)
				{
					return (int)row.RowIndex.Value;
				}
			}
			return -1;
		}
		catch
		{
			return -1;
		}
	}

	private string getColumnName(int columnIndex)
	{
		int num = columnIndex;
		string text = string.Empty;
		while (num > 0)
		{
			int num2 = (num - 1) % 26;
			text = Convert.ToChar(65 + num2) + text;
			num = (num - num2) / 26;
		}
		return text;
	}

	private Cell createTextCell(int columnIndex, int rowIndex, object cellValue)
	{
		Cell cell = new Cell();
		cell.DataType = CellValues.InlineString;
		cell.CellReference = getColumnName(columnIndex) + rowIndex;
		InlineString inlineString = new InlineString();
		Text text = new Text();
		text.Text = cellValue.ToString();
		inlineString.AppendChild(text);
		cell.AppendChild(inlineString);
		return cell;
	}

	private Row createContentRow(DataRow dataRow, int rowIndex)
	{
		Row row = new Row
		{
			RowIndex = (uint)rowIndex
		};
		for (int i = 0; i < dataRow.Table.Columns.Count; i++)
		{
			Cell newChild = createTextCell(i + 1, rowIndex, dataRow[i]);
			row.AppendChild(newChild);
		}
		return row;
	}

	public void ExportDataTable(DataTable table, string exportFile, int startRow)
	{
		using SpreadsheetDocument spreadsheetDocument = SpreadsheetDocument.Open(exportFile, isEditable: true);
		Workbook workbook = spreadsheetDocument.WorkbookPart.Workbook;
		IEnumerable<Sheet> enumerable = workbook.Descendants<Sheet>();
		WorksheetPart worksheetPart = spreadsheetDocument.WorkbookPart.WorksheetParts.Last();
		SheetData firstChild = worksheetPart.Worksheet.GetFirstChild<SheetData>();
		for (int i = 0; i < table.Rows.Count; i++)
		{
			DataRow dataRow = table.Rows[i];
			Row newChild = createContentRow(dataRow, i + startRow);
			firstChild.AppendChild(newChild);
		}
	}

	public void ExportToFile(string exportFile, DataTable dtDonHang, int startRowDonHang)
	{
		using SpreadsheetDocument spreadsheetDocument = SpreadsheetDocument.Open(exportFile, isEditable: true);
		Workbook workbook = spreadsheetDocument.WorkbookPart.Workbook;
		IEnumerable<Sheet> source = workbook.Descendants<Sheet>();
		string id = source.First((Sheet s) => s.Name == "DonHang").Id;
		WorksheetPart worksheetPart = (WorksheetPart)spreadsheetDocument.WorkbookPart.GetPartById(id);
		SheetData firstChild = worksheetPart.Worksheet.GetFirstChild<SheetData>();
		for (int num = 0; num < dtDonHang.Rows.Count; num++)
		{
			uint rowNumber = Convert.ToUInt32(startRowDonHang + num);
			Row row = (from r in firstChild.Elements<Row>()
				where (uint)r.RowIndex == rowNumber
				select r).FirstOrDefault();
			if (row == null)
			{
				DataRow dataRow = dtDonHang.Rows[num];
				row = createContentRow(dataRow, num + startRowDonHang);
				Row row2 = null;
				foreach (Row item in firstChild.Elements<Row>())
				{
					if (item.RowIndex > row.RowIndex)
					{
						row2 = item;
						break;
					}
				}
				if (row2 == null)
				{
					firstChild.Append(row);
				}
				else
				{
					firstChild.InsertBefore(row, row2);
				}
				continue;
			}
			string cellRefA = "A" + (startRowDonHang + num);
			Cell cell = (from c in row.Elements<Cell>()
				where c.CellReference == cellRefA
				select c).FirstOrDefault();
			if (cell == null)
			{
				cell = createTextCell(1, num + startRowDonHang, dtDonHang.Rows[num][0]);
				Cell cell2 = null;
				foreach (Cell item2 in row.Elements<Cell>())
				{
					string value = item2.CellReference.Value;
					value = value.Remove(value.Length - rowNumber.ToString().Length);
					if (value.Length > "A".Length || string.Compare(value, "A", ignoreCase: true) > 0)
					{
						cell2 = item2;
						break;
					}
				}
				if (cell2 == null)
				{
					row.Append(cell);
				}
				else
				{
					row.InsertBefore(cell, cell2);
				}
			}
			else
			{
				cell.DataType = CellValues.String;
				cell.CellValue = new CellValue(dtDonHang.Rows[num][0].ToString());
			}
			string cellRefB = "B" + (startRowDonHang + num);
			Cell cell3 = (from c in row.Elements<Cell>()
				where c.CellReference == cellRefB
				select c).FirstOrDefault();
			if (cell3 == null)
			{
				cell3 = createTextCell(2, num + startRowDonHang, dtDonHang.Rows[num][1]);
				Cell cell4 = null;
				foreach (Cell item3 in row.Elements<Cell>())
				{
					string value2 = item3.CellReference.Value;
					value2 = value2.Remove(value2.Length - rowNumber.ToString().Length);
					if (value2.Length > "B".Length || string.Compare(value2, "B", ignoreCase: true) > 0)
					{
						cell4 = item3;
						break;
					}
				}
				if (cell4 == null)
				{
					row.Append(cell3);
				}
				else
				{
					row.InsertBefore(cell3, cell4);
				}
			}
			else
			{
				cell3.DataType = CellValues.String;
				cell3.CellValue = new CellValue(dtDonHang.Rows[num][1].ToString());
			}
		}
	}

	public void ExportTongHopTatCa(string exportFile, DataTable dtTongHopTatCa, int startRowTongHopTatCa)
	{
		using SpreadsheetDocument spreadsheetDocument = SpreadsheetDocument.Open(exportFile, isEditable: true);
		Workbook workbook = spreadsheetDocument.WorkbookPart.Workbook;
		IEnumerable<Sheet> source = workbook.Descendants<Sheet>();
		string id = source.First((Sheet s) => s.Name == "KqKinhDoanh").Id;
		WorksheetPart worksheetPart = (WorksheetPart)spreadsheetDocument.WorkbookPart.GetPartById(id);
		SheetData firstChild = worksheetPart.Worksheet.GetFirstChild<SheetData>();
		for (int num = 0; num < dtTongHopTatCa.Rows.Count; num++)
		{
			uint rowNumber = Convert.ToUInt32(startRowTongHopTatCa + num);
			(from r in firstChild.Elements<Row>()
				where (uint)r.RowIndex == rowNumber
				select r).FirstOrDefault()?.Remove();
			DataRow dataRow = dtTongHopTatCa.Rows[num];
			Row row = createContentRow(dataRow, num + startRowTongHopTatCa);
			Row row2 = null;
			foreach (Row item in firstChild.Elements<Row>())
			{
				if (item.RowIndex > row.RowIndex)
				{
					row2 = item;
					break;
				}
			}
			if (row2 == null)
			{
				firstChild.Append(row);
			}
			else
			{
				firstChild.InsertBefore(row, row2);
			}
		}
	}
}
