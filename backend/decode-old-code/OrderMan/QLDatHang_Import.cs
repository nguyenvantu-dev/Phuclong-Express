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

public class QLDatHang_Import : System.Web.UI.Page
{
	private string filename = "";

	private DataTable DonHangDT = new DataTable();

	private DataTable WebsiteDT = new DataTable();

	private DataTable LoaiTienDT = new DataTable();

	private DataTable QuocGiaDT = new DataTable();

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
				lbModeDesc.Text = "CHỈNH SỬA ITEM";
				lbModeDesc.ForeColor = System.Drawing.Color.Red;
				cblChinhSua.Visible = true;
			}
			else
			{
				lbModeDesc.Text = "THÊM MỚI ITEM";
				lbModeDesc.ForeColor = System.Drawing.Color.Black;
				cblChinhSua.Visible = false;
			}
		}
		catch
		{
		}
	}

	private void initDonHangDT()
	{
		DonHangDT.Rows.Clear();
		DonHangDT.Columns.Clear();
		DonHangDT.Columns.Add(new DataColumn("ExcelRowIndex", Type.GetType("System.Int32")));
		DonHangDT.Columns.Add(new DataColumn("ID", Type.GetType("System.Int32")));
		DonHangDT.Columns.Add(new DataColumn("WebsiteName", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("username", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("loaitien", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("tygia", Type.GetType("System.Double")));
		DonHangDT.Columns.Add(new DataColumn("QuocGiaID", Type.GetType("System.Int32")));
		DonHangDT.Columns.Add(new DataColumn("TenQuocGia", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("linkweb", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("linkhinh", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("corlor", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("size", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("soluong", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("dongiaweb", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("cong", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("saleoff", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("phuthu", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("shipUSA", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("tax", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("ghichu", Type.GetType("System.String")));
		DonHangDT.Columns.Add(new DataColumn("Error", Type.GetType("System.Boolean")));
	}

	private void initWebsiteDT()
	{
		WebsiteDT.Rows.Clear();
		WebsiteDT.Columns.Clear();
		WebsiteDT.Columns.Add(new DataColumn("ID", Type.GetType("System.Int32")));
		WebsiteDT.Columns.Add(new DataColumn("WebsiteName", Type.GetType("System.String")));
		WebsiteDT.Columns.Add(new DataColumn("GhiChu", Type.GetType("System.String")));
	}

	private void initLoaiTienDT()
	{
		LoaiTienDT.Rows.Clear();
		LoaiTienDT.Columns.Clear();
		LoaiTienDT.Columns.Add(new DataColumn("Name", Type.GetType("System.String")));
		LoaiTienDT.Columns.Add(new DataColumn("TyGiaVND", Type.GetType("System.Double")));
	}

	private void initQuocGiaDT()
	{
		QuocGiaDT.Rows.Clear();
		QuocGiaDT.Columns.Clear();
		QuocGiaDT.Columns.Add(new DataColumn("QuocGiaID", Type.GetType("System.Int32")));
		QuocGiaDT.Columns.Add(new DataColumn("TenQuocGia", Type.GetType("System.String")));
		QuocGiaDT.Columns.Add(new DataColumn("LoaiTien", Type.GetType("System.String")));
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

	private void loadWebsiteDT()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			initWebsiteDT();
			WebsiteDT.Rows.Clear();
			DataSet dataSet = dBConnect.LayDanhSachWebsite();
			for (int i = 0; i < dataSet.Tables[0].Rows.Count; i++)
			{
				DataRow dataRow = dataSet.Tables[0].Rows[i];
				myDataRow = WebsiteDT.NewRow();
				myDataRow["ID"] = Convert.ToInt32(dataRow["ID"]);
				myDataRow["WebsiteName"] = ((dataRow["WebsiteName"] == DBNull.Value) ? "" : dataRow["WebsiteName"].ToString());
				myDataRow["GhiChu"] = ((dataRow["GhiChu"] == DBNull.Value) ? "" : dataRow["GhiChu"].ToString());
				WebsiteDT.Rows.Add(myDataRow);
			}
		}
		catch (Exception)
		{
		}
	}

	private void loadLoaiTienDT()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			initLoaiTienDT();
			LoaiTienDT.Rows.Clear();
			DataSet dataSet = dBConnect.LayDanhSachTyGia();
			for (int i = 0; i < dataSet.Tables[0].Rows.Count; i++)
			{
				DataRow dataRow = dataSet.Tables[0].Rows[i];
				myDataRow = LoaiTienDT.NewRow();
				myDataRow["Name"] = ((dataRow["Name"] == DBNull.Value) ? "" : dataRow["Name"].ToString());
				myDataRow["TyGiaVND"] = Convert.ToDouble(dataRow["TyGiaVND"]);
				LoaiTienDT.Rows.Add(myDataRow);
			}
		}
		catch (Exception)
		{
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
		loadWebsiteDT();
		loadLoaiTienDT();
		loadQuocGiaDT();
		loadUserNameDT();
		string text = "";
		string text2 = "";
		string text3 = "";
		string text4 = "";
		text += "<table class='chitiettracking' cellpadding='0' cellspacing='0'>";
		text2 += "<tr class='chitiettracking-header'>";
		text2 += "<td>Excel Row</td>";
		text2 += "<td>Website</td>";
		text2 += "<td>Username</td>";
		text2 += "<td>Loại tiền</td>";
		text2 += "<td>Quốc gia</td>";
		text2 += "<td>Link SP</td>";
		text2 += "<td>Link hình</td>";
		text2 += "<td>Màu</td>";
		text2 += "<td>Size</td>";
		text2 += "<td>Số lượng</td>";
		text2 += "<td>Giá web</td>";
		text2 += "<td>% công</td>";
		text2 += "<td>% sale off</td>";
		text2 += "<td>Phụ thu</td>";
		text2 += "<td>Ship US</td>";
		text2 += "<td>Tax</td>";
		text2 += "<td>Ghi chú</td>";
		text2 += "</tr>";
		for (int i = 0; i < DonHangDT.Rows.Count; i++)
		{
			text4 = "";
			DataRow dataRow = DonHangDT.Rows[i];
			string text5 = dataRow["ExcelRowIndex"].ToString();
			try
			{
				text4 += "<tr class='chitiettracking-item'>";
				text4 = text4 + "<td>" + dataRow["ExcelRowIndex"].ToString() + "</td>";
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[0].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["WebsiteName"].ToString() + "</td>"));
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[1].Selected))
				{
					if (string.IsNullOrEmpty(dataRow["username"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>Username</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["username"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						DataRow[] array = UserNameDT.Select("UserName = '" + dataRow["username"].ToString() + "'");
						if (array == null || array.Length == 0)
						{
							sError = sError + "Dòng <b>" + text5 + "</b>: User <b>" + dataRow["username"].ToString() + "</b> không có trong danh mục. </BR>";
							text4 = text4 + "<td class='itemerror'>" + dataRow["username"].ToString() + "</td>";
							dataRow["Error"] = true;
						}
						else
						{
							text4 = text4 + "<td >" + dataRow["username"].ToString() + "</td>";
						}
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[2].Selected))
				{
					if (string.IsNullOrEmpty(dataRow["loaitien"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>Loại tiền</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["loaitien"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						DataRow[] array = LoaiTienDT.Select("Name = '" + dataRow["loaitien"].ToString() + "'");
						if (array == null || array.Length == 0)
						{
							sError = sError + "Dòng <b>" + text5 + "</b>: Loại tiền <b>" + dataRow["loaitien"].ToString() + "</b> không có trong danh mục. </BR>";
							text4 = text4 + "<td class='itemerror'>" + dataRow["loaitien"].ToString() + "</td>";
							dataRow["Error"] = true;
						}
						else
						{
							text4 = text4 + "<td >" + dataRow["loaitien"].ToString() + "</td>";
							DonHangDT.Rows[i]["tygia"] = array[0]["TyGiaVND"];
						}
					}
				}
				else
				{
					text4 += "<td ></td>";
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
							DonHangDT.Rows[i]["QuocGiaID"] = array[0]["QuocGiaID"];
						}
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[3].Selected))
				{
					if (string.IsNullOrEmpty(dataRow["linkweb"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>Link SP</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["linkweb"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["linkweb"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[4].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["linkhinh"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[5].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["corlor"].ToString() + "</td>"));
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[6].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["size"].ToString() + "</td>"));
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[7].Selected))
				{
					int result;
					if (string.IsNullOrEmpty(dataRow["soluong"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>Số lượng</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["soluong"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else if (!int.TryParse(dataRow["soluong"].ToString(), out result))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: Số lượng phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["soluong"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["soluong"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[8].Selected))
				{
					double result2;
					if (string.IsNullOrEmpty(dataRow["dongiaweb"].ToString()))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: thiếu <b>Giá web</b>. </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["dongiaweb"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else if (!double.TryParse(dataRow["dongiaweb"].ToString(), out result2))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: Giá web phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["dongiaweb"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["dongiaweb"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[9].Selected))
				{
					double result3;
					if (string.IsNullOrEmpty(dataRow["cong"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else if (!double.TryParse(dataRow["cong"].ToString(), out result3))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: % Công phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["cong"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["cong"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[10].Selected))
				{
					double result4;
					if (string.IsNullOrEmpty(dataRow["saleoff"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else if (!double.TryParse(dataRow["saleoff"].ToString(), out result4))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: % Sale off phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["saleoff"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["saleoff"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[11].Selected))
				{
					double result5;
					if (string.IsNullOrEmpty(dataRow["phuthu"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else if (!double.TryParse(dataRow["phuthu"].ToString(), out result5))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: Phụ thu phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["phuthu"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["phuthu"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[12].Selected))
				{
					double result6;
					if (string.IsNullOrEmpty(dataRow["shipUSA"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else if (!double.TryParse(dataRow["shipUSA"].ToString(), out result6))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: Ship USA phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["shipUSA"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["shipUSA"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				if (tbMode.Text != "1" || (tbMode.Text == "1" && cblChinhSua.Items[13].Selected))
				{
					double result7;
					if (string.IsNullOrEmpty(dataRow["tax"].ToString()))
					{
						text4 += "<td ></td>";
					}
					else if (!double.TryParse(dataRow["tax"].ToString(), out result7))
					{
						sError = sError + "Dòng <b>" + text5 + "</b>: Tax phải là kiểu số </BR>";
						text4 = text4 + "<td class='itemerror'>" + dataRow["tax"].ToString() + "</td>";
						dataRow["Error"] = true;
					}
					else
					{
						text4 = text4 + "<td >" + dataRow["tax"].ToString() + "</td>";
					}
				}
				else
				{
					text4 += "<td ></td>";
				}
				text4 = ((!(tbMode.Text != "1") && (!(tbMode.Text == "1") || !cblChinhSua.Items[15].Selected)) ? (text4 + "<td ></td>") : (text4 + "<td >" + dataRow["ghichu"].ToString() + "</td>"));
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
			initDonHangDT();
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
				string value13 = "";
				string value14 = "";
				string value15 = "";
				string text = "";
				string value16 = "";
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
					else if (item.CellReference == ExcelColumnFromNumber(12 + num2) + row.RowIndex.ToString())
					{
						value13 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(13 + num2) + row.RowIndex.ToString())
					{
						value14 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(14 + num2) + row.RowIndex.ToString())
					{
						value15 = GetCellValue(item, sharedStringTable);
					}
					else if (item.CellReference == ExcelColumnFromNumber(15 + num2) + row.RowIndex.ToString())
					{
						value16 = GetCellValue(item, sharedStringTable);
					}
				}
				DataRow dataRow = DonHangDT.NewRow();
				dataRow["ExcelRowIndex"] = Convert.ToInt32(row.RowIndex.ToString());
				dataRow["ID"] = -1;
				dataRow["WebsiteName"] = value;
				dataRow["username"] = value2;
				dataRow["loaitien"] = value3;
				dataRow["QuocGiaID"] = -1;
				dataRow["TenQuocGia"] = value4;
				dataRow["linkweb"] = value5;
				dataRow["linkhinh"] = value6;
				dataRow["corlor"] = value7;
				dataRow["size"] = value8;
				dataRow["soluong"] = value9;
				dataRow["dongiaweb"] = value10;
				dataRow["cong"] = value11;
				dataRow["saleoff"] = value12;
				dataRow["phuthu"] = value13;
				dataRow["shipUSA"] = value14;
				dataRow["tax"] = value15;
				dataRow["ghichu"] = value16;
				dataRow["Error"] = false;
				DonHangDT.Rows.Add(dataRow);
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
			for (int i = 0; i < DonHangDT.Rows.Count; i++)
			{
				DataRow dataRow = DonHangDT.Rows[i];
				if (!(bool)dataRow["Error"] && !(tbMode.Text == "1") && dBConnect.ThemDatHangSimpleCoTamTinhKhongMoDB(dataRow["WebsiteName"].ToString(), dataRow["username"].ToString(), base.User.Identity.GetUserName(), dataRow["linkweb"].ToString(), dataRow["linkhinh"].ToString(), dataRow["corlor"].ToString(), dataRow["size"].ToString(), Convert.ToInt32(dataRow["soluong"]), Convert.ToDouble(dataRow["dongiaweb"]), dataRow["loaitien"].ToString(), dataRow["ghichu"].ToString(), Convert.ToDouble(dataRow["tygia"]), string.IsNullOrEmpty(dataRow["saleoff"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["saleoff"]), HangKhoan: false, string.IsNullOrEmpty(dataRow["cong"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["cong"]), string.IsNullOrEmpty(dataRow["shipUSA"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["shipUSA"]), string.IsNullOrEmpty(dataRow["tax"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["tax"]), string.IsNullOrEmpty(dataRow["phuthu"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["phuthu"]), Convert.ToInt32(dataRow["QuocGiaID"])))
				{
					TotalRowInsert++;
					text = bLL.NoiDungDonHangSystemLogs(dataRow["username"].ToString(), dataRow["linkweb"].ToString(), dataRow["linkhinh"].ToString(), dataRow["corlor"].ToString(), dataRow["size"].ToString(), Convert.ToInt32(dataRow["soluong"]), Convert.ToDouble(dataRow["dongiaweb"]), string.IsNullOrEmpty(dataRow["saleoff"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["saleoff"]), string.IsNullOrEmpty(dataRow["phuthu"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["phuthu"]), string.IsNullOrEmpty(dataRow["shipUSA"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["shipUSA"]), string.IsNullOrEmpty(dataRow["tax"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["tax"]), string.IsNullOrEmpty(dataRow["cong"].ToString()) ? 0.0 : Convert.ToDouble(dataRow["cong"]), dataRow["loaitien"].ToString(), dataRow["ghichu"].ToString(), Convert.ToDouble(dataRow["tygia"]), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "", "", DateTime.Now.ToString("dd/MM/yyyy HH:mm"), "", "");
					dBConnect.ThemSystemLogsKhongMoDB(base.User.Identity.GetUserName(), "QLDatHang_Import:ThemDatHangSimpleCoTamTinhKhongMoDB", StringEnum.GetStringValue(HanhDong.ThemMoi), "", text);
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
			DonHangDT = (DataTable)arrayList[1];
			TotalRowInsert = (int)arrayList[2];
			WebsiteDT = (DataTable)arrayList[3];
			UserNameDT = (DataTable)arrayList[4];
			LoaiTienDT = (DataTable)arrayList[5];
			QuocGiaDT = (DataTable)arrayList[6];
		}
	}

	protected override object SaveViewState()
	{
		ArrayList arrayList = new ArrayList();
		arrayList.Add(filename);
		arrayList.Add(DonHangDT);
		arrayList.Add(TotalRowInsert);
		arrayList.Add(WebsiteDT);
		arrayList.Add(UserNameDT);
		arrayList.Add(LoaiTienDT);
		arrayList.Add(QuocGiaDT);
		return arrayList;
	}

	protected override void TrackViewState()
	{
		base.TrackViewState();
	}
}
