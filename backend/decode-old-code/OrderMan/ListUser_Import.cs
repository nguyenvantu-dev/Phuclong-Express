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

public class ListUser_Import : System.Web.UI.Page
{
	private string filename = "";

	private DataTable UserDT = new DataTable();

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
				lbModeDesc.Text = "CHỈNH SỬA USER";
				lbModeDesc.ForeColor = System.Drawing.Color.Red;
				cblChinhSua.Visible = true;
			}
			else
			{
				lbModeDesc.Text = "THÊM MỚI USER";
				lbModeDesc.ForeColor = System.Drawing.Color.Black;
				cblChinhSua.Visible = false;
			}
		}
		catch
		{
		}
	}

	private void initUserDT()
	{
		UserDT.Rows.Clear();
		UserDT.Columns.Clear();
		UserDT.Columns.Add(new DataColumn("ExcelRowIndex", Type.GetType("System.Int32")));
		UserDT.Columns.Add(new DataColumn("UserName", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("Password", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("HoTen", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("VungMien", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("DiaChi", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("TinhThanh", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("PhoneNumber", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("Email", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("SoTaiKhoan", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("HinhThucNhanHang", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("KhachBuon", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("LinkTaiKhoanMang", Type.GetType("System.String")));
		UserDT.Columns.Add(new DataColumn("Error", Type.GetType("System.Boolean")));
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
		text2 += "<td>UserName</td>";
		text2 += "<td>Mật khẩu</td>";
		text2 += "<td>Họ tên</ td>";
		text2 += "<td>Vùng miền</td>";
		text2 += "<td>Địa chỉ</td>";
		text2 += "<td>Tỉnh/Thành phố</td>";
		text2 += "<td>Số điện thoại</td>";
		text2 += "<td>Email</td>";
		text2 += "<td>Số tài khoản</td>";
		text2 += "<td>Hình thức nhận hàng</td>";
		text2 += "<td>Khách buôn</td>";
		text2 += "<td>Link FB</td>";
		text2 += "</tr>";
		for (int i = 0; i < UserDT.Rows.Count; i++)
		{
			text4 = "";
			DataRow dataRow = UserDT.Rows[i];
			string text5 = dataRow["ExcelRowIndex"].ToString();
			try
			{
				text4 += "<tr class='chitiettracking-item'>";
				text4 = text4 + "<td>" + dataRow["ExcelRowIndex"].ToString() + "</td>";
				if (string.IsNullOrEmpty(dataRow["UserName"].ToString()))
				{
					sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>UserName</b>. </BR>";
					text4 = text4 + "<td class='itemerror'>" + dataRow["UserName"].ToString() + "</td>";
					dataRow["Error"] = true;
				}
				else if (tbMode.Text == "1")
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
				else
				{
					DataRow[] array = UserNameDT.Select("UserName = '" + dataRow["UserName"].ToString() + "'");
					if (array == null || array.Length == 0)
					{
						text4 = text4 + "<td >" + dataRow["UserName"].ToString() + "</td>";
					}
					else
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: User <b>" + dataRow["UserName"].ToString() + "</b> đã có trong danh mục. Không thể thêm user này</BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["UserName"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
				}
				if (tbMode.Text != "1")
				{
					if (string.IsNullOrEmpty(dataRow["Password"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>Password</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["Password"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["Password"].ToString() + "</td>";
					}
				}
				else
				{
					text4 = text4 + "<td >" + dataRow["Password"].ToString() + "</td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[0].Selected))
				{
					if (string.IsNullOrEmpty(dataRow["HoTen"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>HoTen</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["HoTen"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["HoTen"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[1].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["VungMien"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[2].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["DiaChi"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[3].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["TinhThanh"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[4].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["PhoneNumber"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[5].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["Email"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[6].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["SoTaiKhoan"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[7].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["HinhThucNhanHang"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[8].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["KhachBuon"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[9].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["LinkTaiKhoanMang"].ToString() + "</td>"));
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
			initUserDT();
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
				string value8 = "";
				string value9 = "";
				string value10 = "";
				string value11 = "";
				string value12 = "";
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
					else if (item.CellReference == ExcelColumnFromNumber(7 + num2) + row.RowIndex.ToString())
					{
						value8 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(8 + num2) + row.RowIndex.ToString())
					{
						value9 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(9 + num2) + row.RowIndex.ToString())
					{
						value10 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(10 + num2) + row.RowIndex.ToString())
					{
						value11 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(11 + num2) + row.RowIndex.ToString())
					{
						value12 = GetCellValue(item, sharedStringTable);
					}
				}
				DataRow dataRow = UserDT.NewRow();
				dataRow["ExcelRowIndex"] = Convert.ToInt32(row.RowIndex.ToString());
				dataRow["UserName"] = value;
				dataRow["Password"] = value2;
				dataRow["HoTen"] = value3;
				dataRow["VungMien"] = value4;
				dataRow["DiaChi"] = value5;
				dataRow["TinhThanh"] = value6;
				dataRow["PhoneNumber"] = value7;
				dataRow["Email"] = value8;
				dataRow["SoTaiKhoan"] = value9;
				dataRow["HinhThucNhanHang"] = value10;
				dataRow["KhachBuon"] = value11;
				dataRow["LinkTaiKhoanMang"] = value12;
				dataRow["Error"] = false;
				UserDT.Rows.Add(dataRow);
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
			UserManager userManager = new UserManager();
			userManager.UserValidator = new UserValidator<ApplicationUser>(userManager)
			{
				RequireUniqueEmail = false
			};
			dBConnect.OpenDatabase();
			for (int i = 0; i < UserDT.Rows.Count; i++)
			{
				DataRow dataRow = UserDT.Rows[i];
				if ((bool)dataRow["Error"])
				{
					continue;
				}
				if (tbMode.Text == "1")
				{
					ApplicationUser applicationUser = userManager.FindByName(dataRow["UserName"].ToString());
					if (cblChinhSua.Items[0].Selected)
					{
						applicationUser.HoTen = dataRow["HoTen"].ToString();
					}
					if (cblChinhSua.Items[1].Selected)
					{
						applicationUser.VungMien = dataRow["VungMien"].ToString();
					}
					if (cblChinhSua.Items[2].Selected)
					{
						applicationUser.DiaChi = dataRow["DiaChi"].ToString();
					}
					if (cblChinhSua.Items[3].Selected)
					{
						applicationUser.TinhThanh = dataRow["TinhThanh"].ToString();
					}
					if (cblChinhSua.Items[4].Selected)
					{
						applicationUser.PhoneNumber = dataRow["PhoneNumber"].ToString();
					}
					if (cblChinhSua.Items[5].Selected)
					{
						applicationUser.Email = dataRow["Email"].ToString();
					}
					if (cblChinhSua.Items[6].Selected)
					{
						applicationUser.SoTaiKhoan = dataRow["SoTaiKhoan"].ToString();
					}
					if (cblChinhSua.Items[7].Selected)
					{
						applicationUser.HinhThucNhanHang = dataRow["HinhThucNhanHang"].ToString();
					}
					if (cblChinhSua.Items[8].Selected)
					{
						applicationUser.KhachBuon = !string.IsNullOrEmpty(dataRow["KhachBuon"].ToString()) && Convert.ToBoolean(dataRow["KhachBuon"].ToString());
					}
					if (cblChinhSua.Items[9].Selected)
					{
						applicationUser.LinkTaiKhoanMang = dataRow["LinkTaiKhoanMang"].ToString();
					}
					IdentityResult identityResult = userManager.Update(applicationUser);
					if (identityResult.Succeeded)
					{
						TotalRowInsert++;
						text = bLL.NoiDungUserSystemLogs(dataRow["UserName"].ToString(), dataRow["HoTen"].ToString(), dataRow["DiaChi"].ToString(), dataRow["TinhThanh"].ToString(), dataRow["PhoneNumber"].ToString(), dataRow["Email"].ToString(), dataRow["SoTaiKhoan"].ToString(), dataRow["HinhThucNhanHang"].ToString(), Convert.ToBoolean(dataRow["KhachBuon"]), dataRow["LinkTaiKhoanMang"].ToString(), dataRow["VungMien"].ToString());
						dBConnect.ThemSystemLogsKhongMoDB(base.User.Identity.GetUserName(), "ListUser_Import:UpdateUser", StringEnum.GetStringValue(HanhDong.ChinhSua), dataRow["UserName"].ToString(), text);
					}
				}
				else
				{
					ApplicationUser user = new ApplicationUser
					{
						UserName = dataRow["UserName"].ToString(),
						HoTen = dataRow["HoTen"].ToString(),
						DiaChi = dataRow["DiaChi"].ToString(),
						TinhThanh = dataRow["TinhThanh"].ToString(),
						PhoneNumber = dataRow["PhoneNumber"].ToString(),
						Email = dataRow["Email"].ToString(),
						SoTaiKhoan = dataRow["SoTaiKhoan"].ToString(),
						HinhThucNhanHang = dataRow["HinhThucNhanHang"].ToString(),
						KhachBuon = (!string.IsNullOrEmpty(dataRow["KhachBuon"].ToString()) && Convert.ToBoolean(dataRow["KhachBuon"].ToString())),
						LinkTaiKhoanMang = dataRow["LinkTaiKhoanMang"].ToString(),
						VungMien = dataRow["VungMien"].ToString()
					};
					IdentityResult identityResult2 = userManager.Create(user, dataRow["Password"].ToString());
					if (identityResult2.Succeeded)
					{
						TotalRowInsert++;
						text = bLL.NoiDungUserSystemLogs(dataRow["UserName"].ToString(), dataRow["HoTen"].ToString(), dataRow["DiaChi"].ToString(), dataRow["TinhThanh"].ToString(), dataRow["PhoneNumber"].ToString(), dataRow["Email"].ToString(), dataRow["SoTaiKhoan"].ToString(), dataRow["HinhThucNhanHang"].ToString(), !string.IsNullOrEmpty(dataRow["KhachBuon"].ToString()) && Convert.ToBoolean(dataRow["KhachBuon"].ToString()), dataRow["LinkTaiKhoanMang"].ToString(), dataRow["VungMien"].ToString());
						dBConnect.ThemSystemLogsKhongMoDB(base.User.Identity.GetUserName(), "ListUser_Import:CreateUser", StringEnum.GetStringValue(HanhDong.ThemMoi), "", text);
					}
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
			UserDT = (DataTable)arrayList[1];
			TotalRowInsert = (int)arrayList[2];
			UserNameDT = (DataTable)arrayList[3];
		}
	}

	protected override object SaveViewState()
	{
		ArrayList arrayList = new ArrayList();
		arrayList.Add(filename);
		arrayList.Add(UserDT);
		arrayList.Add(TotalRowInsert);
		arrayList.Add(UserNameDT);
		return arrayList;
	}

	protected override void TrackViewState()
	{
		base.TrackViewState();
	}
}
