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

public class Tracking_Import : System.Web.UI.Page
{
	private string filename = "";

	private DataTable TrackingDT = new DataTable();

	private DataTable QuocGiaDT = new DataTable();

	private DataTable NhaVanChuyenDT = new DataTable();

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
				lbModeDesc.Text = "CHỈNH SỬA TRACKING";
				lbModeDesc.ForeColor = System.Drawing.Color.Red;
				cblChinhSua.Visible = true;
			}
			else
			{
				lbModeDesc.Text = "THÊM MỚI TRACKING";
				lbModeDesc.ForeColor = System.Drawing.Color.Black;
				cblChinhSua.Visible = false;
			}
		}
		catch
		{
		}
	}

	private void initTrackingDT()
	{
		TrackingDT.Rows.Clear();
		TrackingDT.Columns.Clear();
		TrackingDT.Columns.Add(new DataColumn("ExcelRowIndex", Type.GetType("System.Int32")));
		TrackingDT.Columns.Add(new DataColumn("TrackingID", Type.GetType("System.Int32")));
		TrackingDT.Columns.Add(new DataColumn("TrackingNumber", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("UserName", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("OrderNumber", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("QuocGiaID", Type.GetType("System.Int32")));
		TrackingDT.Columns.Add(new DataColumn("TenQuocGia", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("NgayDatHang", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("NhaVanChuyenID", Type.GetType("System.Int32")));
		TrackingDT.Columns.Add(new DataColumn("TenNhaVanChuyen", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("TinhTrang", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("GhiChu", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("Kien", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("Mawb", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("Hawb", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("GhiChuLoHang", Type.GetType("System.String")));
		TrackingDT.Columns.Add(new DataColumn("Error", Type.GetType("System.Boolean")));
		TrackingDT.Columns.Add(new DataColumn("ErrNgayDatHang", Type.GetType("System.Boolean")));
	}

	private void initQuocGiaDT()
	{
		QuocGiaDT.Rows.Clear();
		QuocGiaDT.Columns.Clear();
		QuocGiaDT.Columns.Add(new DataColumn("QuocGiaID", Type.GetType("System.Int32")));
		QuocGiaDT.Columns.Add(new DataColumn("TenQuocGia", Type.GetType("System.String")));
		QuocGiaDT.Columns.Add(new DataColumn("LoaiTien", Type.GetType("System.String")));
	}

	private void initNhaVanChuyenDT()
	{
		NhaVanChuyenDT.Rows.Clear();
		NhaVanChuyenDT.Columns.Clear();
		NhaVanChuyenDT.Columns.Add(new DataColumn("NhaVanChuyenID", Type.GetType("System.Int32")));
		NhaVanChuyenDT.Columns.Add(new DataColumn("TenNhaVanChuyen", Type.GetType("System.String")));
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

	private void loadQuocGiaDT()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			initQuocGiaDT();
			QuocGiaDT.Rows.Clear();
			DataSet dataSet = dBConnect.LayDanhSachQuocGia();
			for (int i = 0; i < dataSet.Tables[0].Rows.Count; i++)
			{
				DataRow dataRow = dataSet.Tables[0].Rows[i];
				myDataRow = QuocGiaDT.NewRow();
				myDataRow["QuocGiaID"] = Convert.ToInt32(dataRow["QuocGiaID"]);
				myDataRow["TenQuocGia"] = ((dataRow["TenQuocGia"] == DBNull.Value) ? "" : dataRow["TenQuocGia"].ToString());
				QuocGiaDT.Rows.Add(myDataRow);
			}
		}
		catch (Exception)
		{
		}
	}

	private void loadNhaVanChuyenDT()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			initNhaVanChuyenDT();
			NhaVanChuyenDT.Rows.Clear();
			DataSet dataSet = dBConnect.LayDanhSachNhaVanChuyen();
			for (int i = 0; i < dataSet.Tables[0].Rows.Count; i++)
			{
				DataRow dataRow = dataSet.Tables[0].Rows[i];
				myDataRow = NhaVanChuyenDT.NewRow();
				myDataRow["NhaVanChuyenID"] = Convert.ToInt32(dataRow["NhaVanChuyenID"]);
				myDataRow["TenNhaVanChuyen"] = ((dataRow["TenNhaVanChuyen"] == DBNull.Value) ? "" : dataRow["TenNhaVanChuyen"].ToString());
				NhaVanChuyenDT.Rows.Add(myDataRow);
			}
		}
		catch (Exception)
		{
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
		loadQuocGiaDT();
		loadNhaVanChuyenDT();
		loadUserNameDT();
		string text = "";
		string text2 = "";
		string text3 = "";
		string text4 = "";
		text += "<table class='chitiettracking' cellpadding='0' cellspacing='0'>";
		text2 += "<tr class='chitiettracking-header'>";
		text2 += "<td>Excel Row</td>";
		text2 += "<td>Số tracking</td>";
		text2 += "<td>Quốc gia</td>";
		text2 += "<td>Khách hàng</td>";
		text2 += "<td>Order number</td>";
		text2 += "<td>Ngày đặt hàng</td>";
		text2 += "<td>Nhà vận chuyển</td>";
		text2 += "<td>Tình trạng</td>";
		text2 += "<td>Ghi chú</td>";
		text2 += "<td>Kiện</td>";
		text2 += "<td>Mawb</td>";
		text2 += "<td>Hawb</td>";
		text2 += "<td>Ghi chú lô hàng</td>";
		text2 += "</tr>";
		for (int i = 0; i < TrackingDT.Rows.Count; i++)
		{
			text4 = "";
			DataRow dataRow = TrackingDT.Rows[i];
			string text5 = dataRow["ExcelRowIndex"].ToString();
			try
			{
				text4 += "<tr class='chitiettracking-item'>";
				text4 = text4 + "<td>" + dataRow["ExcelRowIndex"].ToString() + "</td>";
				if (string.IsNullOrEmpty(dataRow["TrackingNumber"].ToString()))
				{
					sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>Số Tracking</b>. </BR>";
					text4 = text4 + "<td class='itemerror'>" + dataRow["TrackingNumber"].ToString() + "</td>";
					dataRow["Error"] = true;
				}
				else if (tbMode.Text == "1")
				{
					int num = dBConnect.LayTrackingIDByTrackingNumber(dataRow["TrackingNumber"].ToString());
					if (num == -1)
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: Số Tracking <b>" + dataRow["TrackingNumber"].ToString() + "</b> không tồn tại. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["TrackingNumber"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						TrackingDT.Rows[i]["TrackingID"] = num;
						text4 = text4 + "<td >" + dataRow["TrackingNumber"].ToString() + "</td>";
					}
				}
				else
				{
					text4 = text4 + "<td >" + dataRow["TrackingNumber"].ToString() + "</td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[0].Selected))
				{
					if (string.IsNullOrEmpty(dataRow["TenQuocGia"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>QuocGia</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["TenQuocGia"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						DataRow[] array = QuocGiaDT.Select("TenQuocGia = '" + dataRow["TenQuocGia"].ToString() + "'");
						if (array == null || array.Length == 0)
						{
							sError = sError + "Dòng <b>" + text5 + "</b>: QuocGia <b>" + dataRow["TenQuocGia"].ToString() + "</b> không có trong danh mục. </BR>";
							text4 = text4 + "<td class='itemerror'>" + dataRow["TenQuocGia"].ToString() + "</td>";
							dataRow["Error"] = true;
						}
						else
						{
							text4 = text4 + "<td >" + dataRow["TenQuocGia"].ToString() + "</td>";
							TrackingDT.Rows[i]["QuocGiaID"] = array[0]["QuocGiaID"];
						}
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[1].Selected))
				{
					if (string.IsNullOrEmpty(dataRow["UserName"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else
					{
						DataRow[] array = UserNameDT.Select("UserName = '" + dataRow["UserName"].ToString() + "'");
						if (array == null || array.Length == 0)
						{
							sError = sError + "Dòng <b>" + text5 + "</b>: Khách hàng <b>" + dataRow["UserName"].ToString() + "</b> không có trong danh mục. </BR>";
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
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[2].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["OrderNumber"].ToString() + "</td>"));
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[3].Selected))
				{
					if ((bool)dataRow["ErrNgayDatHang"])
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: <b>Ngày đặt hàng</b> không đúng định dạng ngày tháng. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["NgayDatHang"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["NgayDatHang"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[4].Selected))
				{
					if (string.IsNullOrEmpty(dataRow["TenNhaVanChuyen"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else
					{
						DataRow[] array = NhaVanChuyenDT.Select("TenNhaVanChuyen = '" + dataRow["TenNhaVanChuyen"].ToString() + "'");
						if (array == null || array.Length == 0)
						{
							sError = sError + "Dòng <b>" + text5 + "</b>: NhaVanChuyen <b>" + dataRow["TenNhaVanChuyen"].ToString() + "</b> không có trong danh mục. </BR>";
							text4 = text4 + "<td class='itemerror'>" + dataRow["TenNhaVanChuyen"].ToString() + "</td>";
							dataRow["Error"] = true;
						}
						else
						{
							text4 = text4 + "<td >" + dataRow["TenNhaVanChuyen"].ToString() + "</td>";
							TrackingDT.Rows[i]["NhaVanChuyenID"] = array[0]["NhaVanChuyenID"];
						}
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[5].Selected))
				{
					if (string.IsNullOrEmpty(dataRow["TinhTrang"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else if (dataRow["TinhTrang"].ToString() != StringEnum.GetStringValue(TinhTrangTracking.Received) && dataRow["TinhTrang"].ToString() != StringEnum.GetStringValue(TinhTrangTracking.InTransit) && dataRow["TinhTrang"].ToString() != StringEnum.GetStringValue(TinhTrangTracking.InVN) && dataRow["TinhTrang"].ToString() != StringEnum.GetStringValue(TinhTrangTracking.VNTransit) && dataRow["TinhTrang"].ToString() != StringEnum.GetStringValue(TinhTrangTracking.Completed) && dataRow["TinhTrang"].ToString() != StringEnum.GetStringValue(TinhTrangTracking.Cancelled))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: <b>Tình trạng</b> không có trong danh mục. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["TinhTrang"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["TinhTrang"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[6].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["GhiChu"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[7].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["Kien"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[8].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["Mawb"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[9].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["Hawb"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[10].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["GhiChuLoHang"].ToString() + "</td>"));
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
			initTrackingDT();
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
				string text = "";
				string value5 = "";
				string value6 = "";
				string value7 = "";
				string value8 = "";
				string value9 = "";
				string value10 = "";
				string value11 = "";
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
						text = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(5 + num2) + row.RowIndex.ToString())
					{
						value5 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(6 + num2) + row.RowIndex.ToString())
					{
						value6 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(7 + num2) + row.RowIndex.ToString())
					{
						value7 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(8 + num2) + row.RowIndex.ToString())
					{
						value8 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(9 + num2) + row.RowIndex.ToString())
					{
						value9 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(10 + num2) + row.RowIndex.ToString())
					{
						value10 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(11 + num2) + row.RowIndex.ToString())
					{
						value11 = GetCellValue(item, sharedStringTable);
					}
				}
				DataRow dataRow = TrackingDT.NewRow();
				dataRow["ExcelRowIndex"] = Convert.ToInt32(row.RowIndex.ToString());
				dataRow["ErrNgayDatHang"] = false;
				dataRow["TrackingID"] = -1;
				dataRow["TrackingNumber"] = value;
				dataRow["QuocGiaID"] = -1;
				dataRow["TenQuocGia"] = value2;
				dataRow["UserName"] = value3;
				dataRow["OrderNumber"] = value4;
				try
				{
					dataRow["NgayDatHang"] = new DateTime(1900, 1, 1).AddDays(double.Parse(text) - 2.0).ToString("dd/MM/yyyy");
				}
				catch
				{
					if (!string.IsNullOrEmpty(text))
					{
						dataRow["NgayDatHang"] = text;
						dataRow["ErrNgayDatHang"] = true;
					}
					else
					{
						dataRow["NgayDatHang"] = "";
					}
				}
				dataRow["NhaVanChuyenID"] = -1;
				dataRow["TenNhaVanChuyen"] = value5;
				dataRow["TinhTrang"] = value6;
				dataRow["GhiChu"] = value7;
				dataRow["Kien"] = value8;
				dataRow["Mawb"] = value9;
				dataRow["Hawb"] = value10;
				dataRow["GhiChuLoHang"] = value11;
				dataRow["Error"] = false;
				TrackingDT.Rows.Add(dataRow);
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
			string noiDung = "";
			bool flag = false;
			string text = "";
			TotalRowInsert = 0;
			dBConnect.OpenDatabase();
			for (int i = 0; i < TrackingDT.Rows.Count; i++)
			{
				DataRow dataRow = TrackingDT.Rows[i];
				if ((bool)dataRow["Error"])
				{
					continue;
				}
				DateTime? datetimeFromStr = DateTimeUtil.getDatetimeFromStr(dataRow["NgayDatHang"].ToString());
				int? nhaVanChuyenID = null;
				if (!string.IsNullOrEmpty(dataRow["TenNhaVanChuyen"].ToString()))
				{
					nhaVanChuyenID = Convert.ToInt32(dataRow["NhaVanChuyenID"]);
				}
				string tinhTrang = StringEnum.GetStringValue(TinhTrangTracking.Received);
				if (!string.IsNullOrEmpty(dataRow["TinhTrang"].ToString()))
				{
					tinhTrang = dataRow["TinhTrang"].ToString();
				}
				text = dataRow["GhiChuLoHang"].ToString();
				flag = !string.IsNullOrEmpty(text);
				if (tbMode.Text == "1")
				{
					if (dBConnect.CapNhatTrackingKhongMoDB(Convert.ToInt32(dataRow["TrackingID"]), dataRow["UserName"].ToString(), dataRow["TrackingNumber"].ToString(), dataRow["OrderNumber"].ToString(), datetimeFromStr, nhaVanChuyenID, Convert.ToInt32(dataRow["QuocGiaID"]), tinhTrang, dataRow["GhiChu"].ToString(), base.User.Identity.GetUserName(), dataRow["Kien"].ToString(), dataRow["Mawb"].ToString(), dataRow["Hawb"].ToString(), flag, text, cblChinhSua.Items[0].Selected, cblChinhSua.Items[1].Selected, cblChinhSua.Items[2].Selected, cblChinhSua.Items[3].Selected, cblChinhSua.Items[4].Selected, cblChinhSua.Items[5].Selected, cblChinhSua.Items[6].Selected, cblChinhSua.Items[7].Selected, cblChinhSua.Items[8].Selected, cblChinhSua.Items[9].Selected, cblChinhSua.Items[10].Selected))
					{
						TotalRowInsert++;
						noiDung = bLL.NoiDungTrackingSystemLogs(dataRow["UserName"].ToString(), dataRow["TrackingNumber"].ToString(), dataRow["OrderNumber"].ToString(), datetimeFromStr, nhaVanChuyenID, Convert.ToInt32(dataRow["QuocGiaID"]), tinhTrang, dataRow["GhiChu"].ToString(), base.User.Identity.GetUserName(), dataRow["Kien"].ToString(), dataRow["Mawb"].ToString(), dataRow["Hawb"].ToString());
					}
					dBConnect.ThemSystemLogsKhongMoDB(base.User.Identity.GetUserName(), "Tracking_Import:CapNhatTrackingKhongMoDB", StringEnum.GetStringValue(HanhDong.ChinhSua), dataRow["TrackingID"].ToString(), noiDung);
				}
				else if (dBConnect.ThemTrackingKhongMoDB(dataRow["UserName"].ToString(), dataRow["TrackingNumber"].ToString(), dataRow["OrderNumber"].ToString(), datetimeFromStr, nhaVanChuyenID, Convert.ToInt32(dataRow["QuocGiaID"]), tinhTrang, dataRow["GhiChu"].ToString(), base.User.Identity.GetUserName(), dataRow["Kien"].ToString(), dataRow["Mawb"].ToString(), dataRow["Hawb"].ToString(), flag, text))
				{
					TotalRowInsert++;
					noiDung = bLL.NoiDungTrackingSystemLogs(dataRow["UserName"].ToString(), dataRow["TrackingNumber"].ToString(), dataRow["OrderNumber"].ToString(), datetimeFromStr, nhaVanChuyenID, Convert.ToInt32(dataRow["QuocGiaID"]), tinhTrang, dataRow["GhiChu"].ToString(), base.User.Identity.GetUserName(), dataRow["Kien"].ToString(), dataRow["Mawb"].ToString(), dataRow["Hawb"].ToString());
					dBConnect.ThemSystemLogsKhongMoDB(base.User.Identity.GetUserName(), "Tracking_Import:ThemTrackingKhongMoDB", StringEnum.GetStringValue(HanhDong.ThemMoi), "", noiDung);
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
			TrackingDT = (DataTable)arrayList[1];
			TotalRowInsert = (int)arrayList[2];
			QuocGiaDT = (DataTable)arrayList[3];
			UserNameDT = (DataTable)arrayList[4];
		}
	}

	protected override object SaveViewState()
	{
		ArrayList arrayList = new ArrayList();
		arrayList.Add(filename);
		arrayList.Add(TrackingDT);
		arrayList.Add(TotalRowInsert);
		arrayList.Add(QuocGiaDT);
		arrayList.Add(UserNameDT);
		return arrayList;
	}

	protected override void TrackViewState()
	{
		base.TrackViewState();
	}
}
