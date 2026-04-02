using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class ManageCongNo_Import : System.Web.UI.Page
{
	private string filename = "";

	private DataTable CongNoDT = new DataTable();

	private DataTable UserNameDT = new DataTable();

	private DataRow myDataRow;

	protected string sHtmlDataPreview = "";

	private bool bErrorData = false;

	private int TotalRowInsert = 0;

	protected Label lbModeDesc;

	protected TextBox tbMode;

	protected Panel pnSelectFileStep1;

	protected FileUpload fuBaoCaoExcel;

	protected Label lbUpErrorStep0;

	protected HyperLink hlDownloadTemplate;

	protected Button btNextStep1;

	protected Panel pnChooseSheet2;

	protected DropDownList ddSheet;

	protected CheckBoxList cblChinhSua;

	protected Label lbErrorStep2;

	protected Button btBackStep2;

	protected Button btNextStep2;

	protected Panel pnValidateDataStep3;

	protected Label lbValidateExcel;

	protected Button btBackStep3;

	protected Button btNextStep3;

	protected Panel pnFinishStep4;

	protected Label lbAlertFinish;

	protected Button btFinish4;

	protected void Page_Load(object sender, EventArgs e)
	{
		try
		{
			tbMode.Text = Page.Request.QueryString["m"];
			if (tbMode.Text == "1")
			{
				lbModeDesc.Text = "CHỈNH SỬA CÔNG NỢ";
				lbModeDesc.ForeColor = System.Drawing.Color.Red;
				cblChinhSua.Visible = true;
			}
			else
			{
				lbModeDesc.Text = "THÊM MỚI CÔNG NỢ";
				lbModeDesc.ForeColor = System.Drawing.Color.Black;
				cblChinhSua.Visible = false;
			}
		}
		catch
		{
		}
	}

	private void initCongNoDT()
	{
		CongNoDT.Rows.Clear();
		CongNoDT.Columns.Clear();
		CongNoDT.Columns.Add(new DataColumn("ExcelRowIndex", Type.GetType("System.Int32")));
		CongNoDT.Columns.Add(new DataColumn("CongNo_ID", Type.GetType("System.String")));
		CongNoDT.Columns.Add(new DataColumn("UserName", Type.GetType("System.String")));
		CongNoDT.Columns.Add(new DataColumn("NoiDung", Type.GetType("System.String")));
		CongNoDT.Columns.Add(new DataColumn("DR", Type.GetType("System.String")));
		CongNoDT.Columns.Add(new DataColumn("CR", Type.GetType("System.String")));
		CongNoDT.Columns.Add(new DataColumn("GhiChu", Type.GetType("System.String")));
		CongNoDT.Columns.Add(new DataColumn("LoaiPhatSinh", Type.GetType("System.String")));
		CongNoDT.Columns.Add(new DataColumn("Error", Type.GetType("System.Boolean")));
	}

	private void initUserNameDT()
	{
		UserNameDT.Rows.Clear();
		UserNameDT.Columns.Clear();
		UserNameDT.Columns.Add(new DataColumn("UserName", Type.GetType("System.String")));
	}

	protected void btNextStep1_Click(object sender, EventArgs e)
	{
		if (!string.IsNullOrEmpty(fuBaoCaoExcel.FileName))
		{
			try
			{
				string text = base.Server.MapPath("/imgLink").TrimEnd('\\') + "\\";
				string extension = Path.GetExtension(fuBaoCaoExcel.FileName);
				Guid guid = default(Guid);
				filename = text + Guid.NewGuid().ToString() + extension;
				if (extension != ".xlsx")
				{
					lbUpErrorStep0.Text = "File không hợp lệ (vui lòng chọn một file .xlsx)!";
					lbUpErrorStep0.Visible = true;
					return;
				}
				fuBaoCaoExcel.SaveAs(filename);
				LoadSheet(filename);
				ActiveImportStep(2);
			}
			catch (Exception)
			{
			}
			lbUpErrorStep0.Visible = false;
		}
		else
		{
			lbUpErrorStep0.Text = "Chọn file dữ liệu!";
			lbUpErrorStep0.Visible = true;
		}
	}

	protected void btStartImportExcel_Click(object sender, EventArgs e)
	{
		ActiveImportStep(1);
	}

	private void LoadSheet(string sFileName)
	{
		ddSheet.Items.Clear();
		string[] allSheet = ExcelUtils.GetAllSheet(sFileName);
		if (allSheet != null && allSheet.Length != 0)
		{
			string[] array = allSheet;
			foreach (string text in array)
			{
				ddSheet.Items.Add(new ListItem(text, text));
			}
		}
		try
		{
			if (ddSheet.Items.Count > 0)
			{
				ddSheet.SelectedIndex = 0;
			}
		}
		catch
		{
		}
	}

	protected void btBackStep2_Click(object sender, EventArgs e)
	{
		try
		{
			if (!string.IsNullOrEmpty(filename) && File.Exists(filename))
			{
				File.Delete(filename);
			}
		}
		catch
		{
		}
		ActiveImportStep(1);
	}

	protected void btNextStep2_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(ddSheet.SelectedValue))
		{
			lbErrorStep2.Text = "Phải chọn sheet cần Import";
			return;
		}
		string text = "";
		string text2 = "";
		string sError = "";
		string sAlert = "";
		if (!string.IsNullOrEmpty(ddSheet.SelectedValue))
		{
			text = ddSheet.SelectedValue;
			text2 = ValidateColumn(filename, text);
			if (!string.IsNullOrEmpty(text2))
			{
				text2 += text2;
			}
			sHtmlDataPreview = "";
			sHtmlDataPreview = ValidateExcelData(filename, text, out sError, out sAlert);
		}
		string text3 = "";
		if (string.IsNullOrEmpty(text2) && string.IsNullOrEmpty(sError) && string.IsNullOrEmpty(sAlert))
		{
			text3 += "<fieldset>\r\n                                        <legend>Cảnh báo dữ liệu:</legend>\r\n                                        Không có lỗi.\r\n                                    </fieldset>";
		}
		else
		{
			if (!string.IsNullOrEmpty(text2))
			{
				text3 = text3 + "<fieldset>\r\n                                            <legend>Lỗi cấu trúc sheet và column:</legend>" + text2 + "\r\n                                        </fieldset>";
			}
			if (!string.IsNullOrEmpty(sError))
			{
				text3 = text3 + "<fieldset>\r\n                                            <legend>Lỗi dữ liệu:</legend>" + sError + "\r\n                                        </fieldset>";
				bErrorData = true;
			}
		}
		lbValidateExcel.Text = text3;
		ActiveImportStep(3);
		if (!string.IsNullOrEmpty(text2) || !string.IsNullOrEmpty(sError) || !string.IsNullOrEmpty(sError))
		{
			btNextStep3.Enabled = false;
		}
		else
		{
			btNextStep3.Enabled = true;
		}
	}

	protected void btBackStep3_Click(object sender, EventArgs e)
	{
		ActiveImportStep(2);
	}

	protected void btNextStep3_Click(object sender, EventArgs e)
	{
		if (!string.IsNullOrEmpty(ddSheet.SelectedValue))
		{
			LuuExcel();
		}
		ActiveImportStep(4);
		if (!string.IsNullOrEmpty(ddSheet.SelectedValue))
		{
			Label label = lbAlertFinish;
			label.Text = label.Text + "Đã import thành công <b>" + TotalRowInsert + "</b> dòng dữ liệu";
		}
		try
		{
			if (!string.IsNullOrEmpty(filename) && File.Exists(filename))
			{
				File.Delete(filename);
			}
		}
		catch
		{
		}
	}

	protected void btFinish4_Click(object sender, EventArgs e)
	{
		ActiveImportStep(0);
		try
		{
			if (!string.IsNullOrEmpty(filename) && File.Exists(filename))
			{
				File.Delete(filename);
			}
		}
		catch
		{
		}
	}

	private void ActiveImportStep(int step)
	{
		switch (step)
		{
		case 1:
			pnSelectFileStep1.Visible = true;
			pnChooseSheet2.Visible = false;
			pnValidateDataStep3.Visible = false;
			pnFinishStep4.Visible = false;
			break;
		case 2:
			pnSelectFileStep1.Visible = false;
			pnChooseSheet2.Visible = true;
			pnValidateDataStep3.Visible = false;
			pnFinishStep4.Visible = false;
			break;
		case 3:
			pnSelectFileStep1.Visible = false;
			pnChooseSheet2.Visible = false;
			pnValidateDataStep3.Visible = true;
			pnFinishStep4.Visible = false;
			break;
		case 4:
			pnSelectFileStep1.Visible = false;
			pnChooseSheet2.Visible = false;
			pnValidateDataStep3.Visible = false;
			pnFinishStep4.Visible = true;
			break;
		default:
			pnSelectFileStep1.Visible = false;
			pnChooseSheet2.Visible = false;
			pnValidateDataStep3.Visible = false;
			pnFinishStep4.Visible = false;
			break;
		}
	}

	public static byte[] GetBytes(string path)
	{
		try
		{
			FileStream fileStream = File.OpenRead(path);
			byte[] array = new byte[fileStream.Length];
			fileStream.Read(array, 0, array.Length);
			fileStream.Close();
			return array;
		}
		catch (Exception)
		{
			return null;
		}
	}

	private void loadUserNameDT()
	{
		try
		{
			initUserNameDT();
			UserNameDT.Rows.Clear();
			UserManager userManager = new UserManager();
			List<ApplicationUser> list = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			for (int num = 0; num < list.Count; num++)
			{
				myDataRow = UserNameDT.NewRow();
				myDataRow["UserName"] = list[num].UserName;
				UserNameDT.Rows.Add(myDataRow);
			}
		}
		catch (Exception)
		{
		}
	}

	private string ValidateColumn(string sFileName, string sSheetName)
	{
		try
		{
			return "";
		}
		catch (Exception)
		{
			return "";
		}
	}

	private string ValidateExcelData(string sFileName, string sSheetName, out string sError, out string sAlert)
	{
		DBConnect dBConnect = new DBConnect();
		sError = "";
		sAlert = "";
		DocDuLieu(sFileName, sSheetName);
		loadUserNameDT();
		string text = "";
		string text2 = "";
		string text3 = "";
		string text4 = "";
		text += "<table class='chitiettracking' cellpadding='0' cellspacing='0'>";
		text2 += "<tr class='chitiettracking-header'>";
		text2 += "<td>Excel Row</td>";
		text2 += "<td>CongNo_ID</td>";
		text2 += "<td>Khách hàng</td>";
		text2 += "<td>Nội dung</td>";
		text2 += "<td>Số tiền có</td>";
		text2 += "<td>Số tiền nợ</td>";
		text2 += "<td>Ghi chú</td>";
		text2 += "<td>Loại phát sinh</td>";
		text2 += "</tr>";
		for (int i = 0; i < CongNoDT.Rows.Count; i++)
		{
			text4 = "";
			DataRow dataRow = CongNoDT.Rows[i];
			string text5 = dataRow["ExcelRowIndex"].ToString();
			try
			{
				text4 += "<tr class='chitiettracking-item'>";
				text4 = text4 + "<td>" + dataRow["ExcelRowIndex"].ToString() + "</td>";
				if (tbMode.Text == "1")
				{
					int result;
					if (string.IsNullOrEmpty(dataRow["CongNo_ID"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>CongNo_ID</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["CongNo_ID"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else if (!int.TryParse(dataRow["CongNo_ID"].ToString(), out result))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: CongNo_ID phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["CongNo_ID"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["CongNo_ID"].ToString() + "</td>";
					}
				}
				else
				{
					text4 = text4 + "<td >" + dataRow["CongNo_ID"].ToString() + "</td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[0].Selected))
				{
					if (string.IsNullOrEmpty(dataRow["UserName"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>UserName</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["UserName"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						DataRow[] array = UserNameDT.Select("UserName = '" + dataRow["UserName"].ToString() + "'");
						if (array == null || array.Length == 0)
						{
							sError = sError + "Dòng <b>" + text5 + "</b>: User <b>" + dataRow["UserName"].ToString() + "</b> không có trong danh mục. </BR>";
							text4 = text4 + "<td class='itemerror'>" + dataRow["UserName"].ToString() + "</td>";
							dataRow["Error"] = true;
						}
						else
						{
							text4 = text4 + "<td >" + dataRow["UserName"].ToString() + "</td>";
						}
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[1].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["NoiDung"].ToString() + "</td>"));
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[2].Selected))
				{
					double result2;
					if (string.IsNullOrEmpty(dataRow["DR"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else if (!double.TryParse(dataRow["DR"].ToString(), out result2))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: Số tiền nợ phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["DR"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["DR"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[3].Selected))
				{
					double result3;
					if (string.IsNullOrEmpty(dataRow["CR"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else if (!double.TryParse(dataRow["CR"].ToString(), out result3))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: Số tiền có phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["CR"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["CR"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[4].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["GhiChu"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1")) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["LoaiPhatSinh"].ToString() + "</td>"));
				text4 += "</tr>";
				text3 += text4;
			}
			catch
			{
			}
		}
		text = text + text2 + text3;
		return text + "</table>";
	}

	public void DocDuLieu(string sFileName, string sSheetName)
	{
		try
		{
			int num = 1;
			int num2 = 1;
			using SpreadsheetDocument spreadsheetDocument = SpreadsheetDocument.Open(sFileName, isEditable: true);
			Workbook workbook = spreadsheetDocument.WorkbookPart.Workbook;
			IEnumerable<Sheet> source = workbook.Descendants<Sheet>();
			SharedStringTable sharedStringTable = spreadsheetDocument.WorkbookPart.SharedStringTablePart.SharedStringTable;
			string id = source.First((Sheet s) => s.Name == sSheetName).Id;
			WorksheetPart worksheetPart = (WorksheetPart)spreadsheetDocument.WorkbookPart.GetPartById(id);
			Worksheet worksheet = worksheetPart.Worksheet;
			initCongNoDT();
			for (int num3 = 0; num3 < 10; num3++)
			{
				int rowIndex = ExcelUtils.GetRowIndex(sharedStringTable, worksheet, num3, "$START$");
				if (rowIndex != -1)
				{
					num = rowIndex + 1;
					num2 = num3 + 2;
					break;
				}
			}
			int num4 = 0;
			int num5 = worksheet.Descendants<Row>().Count();
			for (num4 = 0; num4 < num5; num4++)
			{
				Row row = worksheet.Descendants<Row>().ElementAt(num4);
				if ((uint)row.RowIndex < num)
				{
					continue;
				}
				int num6 = row.Descendants<Cell>().Count();
				if (num6 < 1)
				{
					continue;
				}
				string value = "";
				string value2 = "";
				string value3 = "";
				string value4 = "";
				string value5 = "";
				string value6 = "";
				string value7 = "";
				foreach (Cell item in row.Descendants<Cell>())
				{
					if (item.CellReference == ExcelColumnFromNumber(num2) + row.RowIndex.ToString())
					{
						value = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(1 + num2) + row.RowIndex.ToString())
					{
						value2 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(2 + num2) + row.RowIndex.ToString())
					{
						value3 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(3 + num2) + row.RowIndex.ToString())
					{
						value4 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(4 + num2) + row.RowIndex.ToString())
					{
						value5 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(5 + num2) + row.RowIndex.ToString())
					{
						value6 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(6 + num2) + row.RowIndex.ToString())
					{
						value7 = GetCellValue(item, sharedStringTable);
					}
				}
				DataRow dataRow = CongNoDT.NewRow();
				dataRow["ExcelRowIndex"] = Convert.ToInt32(row.RowIndex.ToString());
				dataRow["CongNo_ID"] = value;
				dataRow["UserName"] = value2;
				dataRow["NoiDung"] = value3;
				dataRow["DR"] = value4;
				dataRow["CR"] = value5;
				dataRow["GhiChu"] = value6;
				dataRow["LoaiPhatSinh"] = value7;
				dataRow["Error"] = false;
				CongNoDT.Rows.Add(dataRow);
			}
		}
		catch (Exception)
		{
		}
	}

	private void LuuExcel()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			BLL bLL = new BLL();
			string text = "";
			TotalRowInsert = 0;
			dBConnect.OpenDatabase();
			for (int i = 0; i < CongNoDT.Rows.Count; i++)
			{
				DataRow dataRow = CongNoDT.Rows[i];
				if ((bool)dataRow["Error"] || (dataRow["DR"].ToString().Trim() == "" && dataRow["CR"].ToString().Trim() == ""))
				{
					continue;
				}
				if (!double.TryParse(dataRow["DR"].ToString().Trim(), out var result))
				{
					if (!(dataRow["DR"].ToString().Trim() == ""))
					{
						continue;
					}
					result = 0.0;
				}
				if (!double.TryParse(dataRow["CR"].ToString().Trim(), out var result2))
				{
					if (!(dataRow["CR"].ToString().Trim() == ""))
					{
						continue;
					}
					result2 = 0.0;
				}
				int loaiPhatSinh = 2;
				if (!string.IsNullOrEmpty(dataRow["LoaiPhatSinh"].ToString()))
				{
					string text2 = dataRow["LoaiPhatSinh"].ToString();
					string text3 = text2;
					loaiPhatSinh = ((text3 == "Khac") ? 2 : ((!(text3 == "Kg")) ? 2 : 8));
				}
				DateTime now = DateTime.Now;
				if (tbMode.Text == "1")
				{
					if (dBConnect.CapNhatCongNoKhongMoDB(Convert.ToInt32(dataRow["CongNo_ID"]), dataRow["UserName"].ToString(), dataRow["NoiDung"].ToString(), result, result2, dataRow["GhiChu"].ToString(), Status: true, null, base.User.Identity.GetUserName(), cblChinhSua.Items[0].Selected, cblChinhSua.Items[1].Selected, cblChinhSua.Items[2].Selected, cblChinhSua.Items[3].Selected, cblChinhSua.Items[4].Selected, udStatus: false, udLoHangID: false))
					{
						TotalRowInsert++;
						text = bLL.NoiDungCongNoSystemLogs(dataRow["UserName"].ToString(), dataRow["NoiDung"].ToString(), now.ToString("dd/MM/yyyy HH:mm:ss"), result, result2, dataRow["GhiChu"].ToString(), status: true);
						dBConnect.ThemSystemLogsKhongMoDB(base.User.Identity.GetUserName(), "ManageCongNo_Import:CapNhatCongNoKhongMoDB", StringEnum.GetStringValue(HanhDong.ChinhSua), dataRow["CongNo_ID"].ToString(), text);
					}
				}
				else if (dBConnect.Insert_CongNoKhongMoDB(dataRow["UserName"].ToString(), dataRow["NoiDung"].ToString(), now, result, result2, dataRow["GhiChu"].ToString(), Status: true, null, base.User.Identity.GetUserName(), loaiPhatSinh))
				{
					TotalRowInsert++;
					text = bLL.NoiDungCongNoSystemLogs(dataRow["UserName"].ToString(), dataRow["NoiDung"].ToString(), now.ToString("dd/MM/yyyy HH:mm:ss"), result, result2, dataRow["GhiChu"].ToString(), status: true);
					dBConnect.ThemSystemLogsKhongMoDB(base.User.Identity.GetUserName(), "ManageCongNo_Import:Insert_CongNoKhongMoDB", StringEnum.GetStringValue(HanhDong.ThemMoi), "", text);
				}
			}
			dBConnect.CloseDatabase();
		}
		catch (Exception)
		{
		}
	}

	public static string ExcelColumnFromNumber(int column)
	{
		string text = "";
		decimal num = column;
		while (num > 0m)
		{
			decimal num2 = (num - 1m) % 26m;
			text = (char)(num2 + 65m) + text;
			num = (num - (num2 + 1m)) / 26m;
		}
		return text;
	}

	public static int NumberFromExcelColumn(string column)
	{
		int num = 0;
		string text = column.ToUpper();
		for (int num2 = text.Length - 1; num2 >= 0; num2--)
		{
			char c = text[num2];
			int num3 = c - 64;
			num += num3 * (int)Math.Pow(26.0, text.Length - (num2 + 1));
		}
		return num;
	}

	private string GetCellValue(Cell c, SharedStringTable sharedStrings)
	{
		if (c.DataType != null && c.DataType.HasValue && (CellValues)c.DataType == CellValues.SharedString)
		{
			return sharedStrings.ChildElements[int.Parse(c.CellValue.InnerText)].InnerText;
		}
		if (c.CellValue != null)
		{
			return c.CellValue.InnerText;
		}
		return "";
	}

	public static DateTime getDatetimeFromStr(string vNew)
	{
		string[] array = vNew.Split('/');
		if (array.Length < 3)
		{
			return default(DateTime);
		}
		return new DateTime(Convert.ToInt32(array[2]), Convert.ToInt32(array[1]), Convert.ToInt32(array[0]));
	}

	protected override void LoadViewState(object state)
	{
		if (state != null)
		{
			ArrayList arrayList = (ArrayList)state;
			filename = arrayList[0].ToString();
			CongNoDT = (DataTable)arrayList[1];
			TotalRowInsert = (int)arrayList[2];
			UserNameDT = (DataTable)arrayList[3];
		}
	}

	protected override object SaveViewState()
	{
		ArrayList arrayList = new ArrayList();
		arrayList.Add(filename);
		arrayList.Add(CongNoDT);
		arrayList.Add(TotalRowInsert);
		arrayList.Add(UserNameDT);
		return arrayList;
	}

	protected override void TrackViewState()
	{
		base.TrackViewState();
	}
}
