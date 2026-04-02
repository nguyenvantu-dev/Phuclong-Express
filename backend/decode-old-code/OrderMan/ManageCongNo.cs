using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class ManageCongNo : Page
{
	private int pageNum = 1;

	private int pageSize = 200;

	protected Label lbLoi;

	protected DropDownList drUserName;

	protected DropDownList ddNganHang;

	protected TextBox tbNoiDung;

	protected TextBox tbNgay;

	protected TextBox tbCR;

	protected TextBox tbDR;

	protected TextBox tbGhichu;

	protected DropDownList ddLoHang;

	protected DropDownList ddLoaiPhatSinh;

	protected Button btDongY;

	protected DropDownList druser;

	protected DropDownList drTrangThai;

	protected DropDownList drLoaiPhatSinh;

	protected DropDownList ddLocNganHang;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected Button tbTim;

	protected Button btExportToExcel1Page;

	protected Button btExportToExcelAllWithFilter;

	protected GridView gvCongNo;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
			LoadDanhSachCongNo();
			LoadDanhSachTaiKhoanNganHang();
			LoadDanhSachLoHangTheoUser();
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			drUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			drUserName.DataBind();
			druser.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			druser.DataBind();
			druser.Items.Insert(0, new ListItem("--Tất cả User--", ""));
		}
		catch
		{
		}
	}

	private void LoadDataUser(DropDownList ddgvUserName, string Selecteditemvalue)
	{
		try
		{
			UserManager userManager = new UserManager();
			ddgvUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddgvUserName.DataBind();
			if (!string.IsNullOrEmpty(Selecteditemvalue))
			{
				ddgvUserName.ClearSelection();
				ListItem listItem = ddgvUserName.Items.FindByValue(Selecteditemvalue);
				if (listItem != null)
				{
					listItem.Selected = true;
				}
			}
		}
		catch
		{
		}
	}

	private void LoadDanhSachTaiKhoanNganHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSource = dBConnect.LayDanhSachTaiKhoanNganHang();
			ddNganHang.DataSource = dataSource;
			ddNganHang.DataBind();
			ddNganHang.Items.Insert(0, new ListItem("--Chọn tài khoản--", ""));
			ddLocNganHang.DataSource = dataSource;
			ddLocNganHang.DataBind();
			ddLocNganHang.Items.Insert(0, new ListItem("--Tất cả tài khoản--", ""));
		}
		catch
		{
		}
	}

	private void LoadDanhSachLoHangTheoUser()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSource = dBConnect.LayDanhSachLoHangTheoUser(drUserName.SelectedValue);
			ddLoHang.DataSource = dataSource;
			ddLoHang.DataBind();
			ddLoHang.Items.Insert(0, new ListItem("--Chọn lô hàng--", ""));
		}
		catch
		{
		}
	}

	private void LoadDataLoHang(DropDownList ddgvLoHang, string UserName, string Selecteditemvalue)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSource = dBConnect.LayDanhSachLoHangTheoUser(UserName);
			ddgvLoHang.DataSource = dataSource;
			ddgvLoHang.DataBind();
			ddgvLoHang.Items.Insert(0, new ListItem("--Chọn lô hàng--", ""));
			if (!string.IsNullOrEmpty(Selecteditemvalue))
			{
				ddgvLoHang.ClearSelection();
				ListItem listItem = ddgvLoHang.Items.FindByValue(Selecteditemvalue);
				if (listItem != null)
				{
					listItem.Selected = true;
				}
			}
		}
		catch
		{
		}
	}

	protected void btDongY_Click(object sender, EventArgs e)
	{
		bool status = true;
		if (tbNoiDung.Text.Trim() == "")
		{
			lbLoi.Text = "Bạn phải nhập nội dung công nợ";
		}
		else if (tbNgay.Text.Trim() == "")
		{
			lbLoi.Text = "Bạn phải nhập ngày phát sinh công nợ";
		}
		else
		{
			if (tbDR.Text.Trim() == "" && tbCR.Text.Trim() == "")
			{
				return;
			}
			if (!double.TryParse(tbDR.Text.Trim(), out var result))
			{
				lbLoi.Text = "Tiền Nợ phải là kiểu số";
				return;
			}
			if (!double.TryParse(tbCR.Text.Trim(), out var result2))
			{
				lbLoi.Text = "Tiền Có phải là kiểu số";
				return;
			}
			int? loHangID = ((ddLoHang.SelectedValue == "") ? ((int?)null) : new int?(Convert.ToInt32(ddLoHang.SelectedValue)));
			DBConnect dBConnect = new DBConnect();
			string text = "";
			if (!string.IsNullOrEmpty(tbGhichu.Text.Trim()))
			{
				text = tbGhichu.Text.Trim() + " - ";
			}
			if (!string.IsNullOrEmpty(ddNganHang.SelectedValue) && result2 != 0.0)
			{
				text = text + "Báo chuyển khoản - " + ddNganHang.SelectedValue;
			}
			if (loHangID.HasValue)
			{
				text = text + " - Lô hàng: " + ddLoHang.SelectedItem.Text;
			}
			if (dBConnect.Insert_CongNo(drUserName.SelectedItem.Text.Trim(), tbNoiDung.Text.Trim(), DateTimeUtil.getDatetimeFromStrWithCurrentMinute(tbNgay.Text.Trim()), result, result2, text, status, loHangID, base.User.Identity.GetUserName(), Convert.ToInt32(ddLoaiPhatSinh.SelectedValue)))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ManageCongNo:Insert_CongNo", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "UserName: " + drUserName.SelectedItem.Text.Trim() + "; NoiDung: " + tbNoiDung.Text.Trim() + "; Ngay: " + tbNgay.Text.Trim() + "; DR: " + result + "; CR: " + result2 + "; GhiChu: " + text + "; status: " + status + "; Loại phát sinh: " + ddLoaiPhatSinh.SelectedValue);
				lbLoi.Text = "Đã thêm thành công";
			}
			else
			{
				lbLoi.Text = "Bị lỗi, vui lòng xem lại thông tin trước khi thêm";
			}
			LoadDanhSachCongNo();
		}
	}

	private void LoadDanhSachCongNo()
	{
		try
		{
			string tuNgay = "";
			string denNgay = "";
			try
			{
				if (!string.IsNullOrEmpty(tbTuNgay.Text))
				{
					tuNgay = DateTimeUtil.getSqlDatetime(tbTuNgay.Text);
				}
			}
			catch
			{
			}
			try
			{
				if (!string.IsNullOrEmpty(tbDenNgay.Text))
				{
					denNgay = DateTimeUtil.getSqlDatetime(tbDenNgay.Text);
				}
			}
			catch
			{
			}
			string loaiPhatSinh = "";
			if (drLoaiPhatSinh.SelectedValue != "-1")
			{
				loaiPhatSinh = drLoaiPhatSinh.SelectedValue;
			}
			BLL bLL = new BLL();
			CongNoPhanTrang congNoPhanTrang = bLL.LayDanhSachCongNo1(druser.SelectedItem.Value, Convert.ToInt32(drTrangThai.SelectedItem.Value), loaiPhatSinh, (ddLocNganHang.SelectedValue == null) ? "" : ddLocNganHang.SelectedValue, tuNgay, denNgay, pageSize, pageNum);
			gvCongNo.DataSource = congNoPhanTrang.DanhSachCongNo;
			gvCongNo.DataBind();
			myPager.BuildPaging(pageNum, congNoPhanTrang.TotalItem, pageSize);
		}
		catch
		{
		}
	}

	protected void tbTim_Click(object sender, EventArgs e)
	{
		LoadDanhSachCongNo();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachCongNo();
	}

	protected void gvCongNo_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvCongNo.EditIndex = e.NewEditIndex;
			LoadDanhSachCongNo();
		}
		catch (Exception)
		{
		}
	}

	protected void gvCongNo_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			int num = Convert.ToInt32(gvCongNo.DataKeys[e.RowIndex]["CongNo_ID"]);
			DropDownList dropDownList = gvCongNo.Rows[e.RowIndex].FindControl("ddgvUserName") as DropDownList;
			TextBox textBox = gvCongNo.Rows[e.RowIndex].FindControl("tbgvNoiDung") as TextBox;
			TextBox textBox2 = gvCongNo.Rows[e.RowIndex].FindControl("tbgvDR") as TextBox;
			TextBox textBox3 = gvCongNo.Rows[e.RowIndex].FindControl("tbgvCR") as TextBox;
			TextBox textBox4 = gvCongNo.Rows[e.RowIndex].FindControl("tbgvGhiChu") as TextBox;
			DropDownList dropDownList2 = gvCongNo.Rows[e.RowIndex].FindControl("ddgvStatus") as DropDownList;
			DropDownList dropDownList3 = gvCongNo.Rows[e.RowIndex].FindControl("ddgvLoHang") as DropDownList;
			bool flag = true;
			if (textBox.Text.Trim() == "")
			{
				lbLoi.Text = "Bạn phải nhập nội dung công nợ";
			}
			else
			{
				if (textBox2.Text.Trim() == "" && textBox3.Text.Trim() == "")
				{
					return;
				}
				if (!double.TryParse(textBox2.Text.Trim(), out var result))
				{
					lbLoi.Text = "Tiền Nợ phải là kiểu số";
					return;
				}
				if (!double.TryParse(textBox3.Text.Trim(), out var result2))
				{
					lbLoi.Text = "Tiền Có phải là kiểu số";
					return;
				}
				flag = ((dropDownList2.SelectedIndex != 0) ? true : false);
				int? loHangID = ((dropDownList3.SelectedValue == "") ? ((int?)null) : new int?(Convert.ToInt32(dropDownList3.SelectedValue)));
				DBConnect dBConnect = new DBConnect();
				int num2 = dBConnect.KiemTraDuocCapNhatCongNoByID(num, dropDownList.SelectedItem.Text.Trim());
				switch (num2)
				{
				case 0:
					if (dBConnect.CapNhatCongNo(num, dropDownList.SelectedItem.Text.Trim(), textBox.Text.Trim(), result, result2, textBox4.Text.Trim(), flag, loHangID, base.User.Identity.GetUserName()))
					{
						dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ManageCongNo:CapNhatCongNo", StringEnum.GetStringValue(HanhDong.ChinhSua), num.ToString(), "ID:" + num + "; UserName: " + dropDownList.SelectedItem.Text.Trim() + "; NoiDung: " + textBox.Text.Trim() + "; DR: " + result + "; CR: " + result2 + "; GhiChu: " + textBox4.Text.Trim() + "; status: " + flag);
						gvCongNo.EditIndex = -1;
						LoadDanhSachCongNo();
					}
					break;
				default:
					if (num2 != 3)
					{
						if (num2 == -1)
						{
							base.Response.Write("<script>alert('Có lỗi trong quá trình thực hiện. Vui lòng thực hiện lại');</script>");
						}
						break;
					}
					goto case 1;
				case 1:
				case 2:
					base.Response.Write("<script>alert('Không được cập nhật công nợ này do đã đóng kỳ');</script>");
					break;
				}
			}
		}
		catch (Exception)
		{
		}
	}

	protected void gvCongNo_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvCongNo.EditIndex = -1;
		LoadDanhSachCongNo();
	}

	protected void gvCongNo_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int congNo_ID = Convert.ToInt32(gvCongNo.DataKeys[e.RowIndex]["CongNo_ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaCongNo(congNo_ID, base.User.Identity.GetUserName()))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ManageCongNo:XoaCongNo", StringEnum.GetStringValue(HanhDong.Xoa), "", "ID: " + congNo_ID);
				LoadDanhSachCongNo();
			}
		}
		catch
		{
		}
	}

	protected void gvCongNo_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && (e.Row.RowState & DataControlRowState.Edit) == DataControlRowState.Edit)
		{
			DropDownList ddgvUserName = (DropDownList)e.Row.FindControl("ddgvUserName");
			LoadDataUser(ddgvUserName, ((CongNo)e.Row.DataItem).UserName);
			DropDownList dropDownList = (DropDownList)e.Row.FindControl("ddgvStatus");
			if (((CongNo)e.Row.DataItem).Status)
			{
				dropDownList.SelectedIndex = 1;
			}
			else
			{
				dropDownList.SelectedIndex = 0;
			}
			DropDownList ddgvLoHang = (DropDownList)e.Row.FindControl("ddgvLoHang");
			string selecteditemvalue = "";
			if (((CongNo)e.Row.DataItem).LoHangID.HasValue)
			{
				selecteditemvalue = ((CongNo)e.Row.DataItem).LoHangID.Value.ToString();
			}
			LoadDataLoHang(ddgvLoHang, ((CongNo)e.Row.DataItem).UserName, selecteditemvalue);
		}
	}

	protected void gvCongNo_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		try
		{
			int congNo_ID = Convert.ToInt32(e.CommandArgument);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.ApproveCongNo(congNo_ID, base.User.Identity.GetUserName()))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ManageCongNo:ApproveCongNo", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + congNo_ID);
				LoadDanhSachCongNo();
			}
		}
		catch
		{
		}
	}

	protected void drUserName_SelectedIndexChanged(object sender, EventArgs e)
	{
		LoadDanhSachLoHangTheoUser();
	}

	protected void ExportToExcel()
	{
		base.Response.Clear();
		base.Response.Buffer = true;
		base.Response.AddHeader("content-disposition", "attachment;filename=DanhSachDatHang.xls");
		base.Response.Charset = "";
		base.Response.ContentType = "application/vnd.xlsx";
		StringWriter stringWriter = new StringWriter();
		HtmlTextWriter writer = new HtmlTextWriter(stringWriter);
		gvCongNo.RenderControl(writer);
		string input = Regex.Replace(stringWriter.ToString(), "(<img \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<input type=\"checkbox\"\\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<a \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		base.Response.Write(input.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	protected void btExportToExcel_Click(object sender, EventArgs e)
	{
		ExportToExcel();
	}

	public override void VerifyRenderingInServerForm(Control control)
	{
	}

	protected void btExportToExcel1Page_Click(object sender, EventArgs e)
	{
		base.Response.Clear();
		base.Response.Buffer = true;
		base.Response.AddHeader("content-disposition", "attachment;filename=DanhSachCongNo.xls");
		base.Response.Charset = "";
		base.Response.ContentType = "application/vnd.xlsx";
		StringWriter stringWriter = new StringWriter();
		HtmlTextWriter writer = new HtmlTextWriter(stringWriter);
		gvCongNo.RenderControl(writer);
		string input = Regex.Replace(stringWriter.ToString(), "(<img \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<input type=\"checkbox\"\\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<a \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		base.Response.Write(input.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	protected void btExportToExcelAllWithFilter_Click(object sender, EventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		ExcelUtils excelUtils = new ExcelUtils();
		string tuNgay = "";
		string denNgay = "";
		try
		{
			if (!string.IsNullOrEmpty(tbTuNgay.Text))
			{
				tuNgay = DateTimeUtil.getSqlDatetime(tbTuNgay.Text);
			}
		}
		catch
		{
		}
		try
		{
			if (!string.IsNullOrEmpty(tbDenNgay.Text))
			{
				denNgay = DateTimeUtil.getSqlDatetime(tbDenNgay.Text);
			}
		}
		catch
		{
		}
		DataSet dataSet = null;
		string loaiPhatSinh = "";
		if (drLoaiPhatSinh.SelectedValue != "-1")
		{
			loaiPhatSinh = drLoaiPhatSinh.SelectedValue;
		}
		BLL bLL = new BLL();
		dataSet = dBConnect.LayDanhSachCongNo1(druser.SelectedItem.Value, Convert.ToInt32(drTrangThai.SelectedItem.Value), loaiPhatSinh, (ddLocNganHang.SelectedValue == null) ? "" : ddLocNganHang.SelectedValue, tuNgay, denNgay, 10000000, 1);
		int num = 0;
		DataTable dataTable = new DataTable();
		if (dataSet != null && dataSet.Tables.Count > 0)
		{
			num = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]);
			DataView dataView = new DataView(dataSet.Tables[1]);
			dataTable = dataView.ToTable(false, "CongNo_ID", "UserName", "TenLoHang", "NoiDung", "NgayGhiNo", "DR", "CR", "GhiChu", "Status", "NguoiTao", "NguoiCapNhatCuoi", "NgayCapNhatCuoi");
		}
		base.Response.ClearContent();
		base.Response.Clear();
		base.Response.ContentType = "application/vnd.xls";
		base.Response.ContentEncoding = Encoding.UTF8;
		base.Response.AppendHeader("Content-Disposition", string.Format("attachment; filename=DanhSachCongNo_{0}.xls", DateTime.Now.ToString("yyyyMMdd_HHmm")));
		base.Response.Charset = Encoding.UTF8.WebName;
		base.Response.HeaderEncoding = Encoding.UTF8;
		base.Response.ContentEncoding = Encoding.UTF8;
		base.Response.BinaryWrite(Encoding.UTF8.GetPreamble());
		StringBuilder stringBuilder = new StringBuilder();
		for (int i = 0; i < dataTable.Columns.Count; i++)
		{
			stringBuilder.Append(dataTable.Columns[i].ColumnName + ",");
		}
		stringBuilder.Append("\r\n");
		for (int j = 0; j < dataTable.Rows.Count; j++)
		{
			for (int k = 0; k < dataTable.Columns.Count; k++)
			{
				stringBuilder.Append(dataTable.Rows[j][k].ToString().Replace(",", ";").Replace("\n", " ")
					.Replace("\r", " ") + ",");
			}
			stringBuilder.Append("\r\n");
		}
		base.Response.Output.Write(stringBuilder.ToString());
		base.Response.Flush();
		base.Response.End();
	}
}
