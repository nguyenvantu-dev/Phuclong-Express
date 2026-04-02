using System;
using System.Data;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class LoHang_ChiTiet : Page
{
	protected Label lbLoi;

	protected Label Label1;

	protected Label lbLoHang;

	protected DropDownList ddUserName;

	protected GridView gvShipVeVN;

	protected GridView gvThueHaiQuan;

	protected GridView gvTracking;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataUser();
			if (!int.TryParse(Page.Request.QueryString["id"], out var result))
			{
				Page.Response.Redirect("/admin/LoHang_LietKe.aspx");
				return;
			}
			LoadDataLoHang(result);
			LoadDataLoHang_PhiShipVeVN(result);
			LoadDataLoHang_ThueHaiQuan(result);
			LoadDanhTracking();
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			ddUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddUserName.DataBind();
		}
		catch
		{
		}
	}

	private void LoadDataLoHang(int LoHangID)
	{
		BLL bLL = new BLL();
		LoHang loHang = bLL.LayLoHangByID(LoHangID);
		try
		{
			ddUserName.ClearSelection();
			ddUserName.Items.FindByValue(loHang.UserName).Selected = true;
		}
		catch
		{
		}
		lbLoHang.Text = loHang.TenLoHang;
	}

	private void LoadDataLoHang_PhiShipVeVN(int LoHangID)
	{
		DBConnect dBConnect = new DBConnect();
		DataSet dataSet = dBConnect.LayDanhSachLoHang_PhiShipVeVNByID(LoHangID);
		if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
		{
			gvShipVeVN.DataKeyNames = new string[1] { "LoHang_PhiShipVeVNID" };
			gvShipVeVN.DataSource = dataSet;
		}
		else
		{
			gvShipVeVN.DataKeyNames = new string[0];
			gvShipVeVN.DataSource = new object[1];
		}
		gvShipVeVN.DataBind();
	}

	protected void gvShipVeVN_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && e.Row.DataItem == null)
		{
			e.Row.Visible = false;
		}
		if (e.Row.RowType != DataControlRowType.DataRow || (e.Row.RowState & DataControlRowState.Edit) != DataControlRowState.Edit)
		{
			return;
		}
		DBConnect dBConnect = new DBConnect();
		DropDownList dropDownList = (DropDownList)e.Row.FindControl("ddgvLoaiHangShip");
		dropDownList.DataSource = dBConnect.LayDanhSachLoaiHangShip();
		dropDownList.DataBind();
		try
		{
			dropDownList.ClearSelection();
			ListItem listItem = dropDownList.Items.FindByValue(DataBinder.Eval(e.Row.DataItem, "LoaiHangShipID").ToString());
			if (listItem != null)
			{
				listItem.Selected = true;
			}
		}
		catch
		{
		}
	}

	protected void gvShipVeVN_DataBound(object sender, EventArgs e)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DropDownList dropDownList = gvShipVeVN.FooterRow.FindControl("ddLoaiHangShip") as DropDownList;
			dropDownList.DataSource = dBConnect.LayDanhSachLoaiHangShip();
			dropDownList.DataBind();
		}
		catch
		{
		}
	}

	protected void gvShipVeVN_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		int loHangID = Convert.ToInt32(Page.Request.QueryString["id"]);
		if (e.CommandName == "Insert")
		{
			DropDownList dropDownList = gvShipVeVN.FooterRow.FindControl("ddLoaiHangShip") as DropDownList;
			TextBox textBox = gvShipVeVN.FooterRow.FindControl("tbftCanNang") as TextBox;
			TextBox textBox2 = gvShipVeVN.FooterRow.FindControl("tbftDonGia") as TextBox;
			TextBox textBox3 = gvShipVeVN.FooterRow.FindControl("tbftTongTienShipVeVN_VND") as TextBox;
			if (dBConnect.ThemLoHang_PhiShipVeVN(loHangID, Convert.ToInt32(dropDownList.SelectedValue), Convert.ToDouble(textBox.Text.Trim()), Convert.ToInt32(textBox2.Text.Trim()), Convert.ToInt32(textBox3.Text.Trim()), base.User.Identity.GetUserName()))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "LoHang_ChiTiet:ThemPhiShipVeVN", StringEnum.GetStringValue(HanhDong.ThemMoi), loHangID.ToString(), "LoHangID: " + loHangID + "LoaiHangShip: " + dropDownList.SelectedValue + "CanNang: " + textBox.Text.Trim() + "DonGia: " + textBox2.Text.Trim() + "TongTienShipVeVN_VND: " + textBox3.Text.Trim());
				LoadDataLoHang_PhiShipVeVN(loHangID);
			}
		}
		else if (e.CommandName == "TinhTienShipFooter")
		{
			DropDownList dropDownList2 = gvShipVeVN.FooterRow.FindControl("ddLoaiHangShip") as DropDownList;
			TextBox textBox4 = gvShipVeVN.FooterRow.FindControl("tbftCanNang") as TextBox;
			TextBox textBox5 = gvShipVeVN.FooterRow.FindControl("tbftDonGia") as TextBox;
			TextBox textBox6 = gvShipVeVN.FooterRow.FindControl("tbftTongTienShipVeVN_VND") as TextBox;
			textBox5.Text = dBConnect.LayDonGiaLoaiHangShip(Convert.ToInt32(dropDownList2.SelectedValue)).ToString();
			textBox6.Text = EnhancedMath.RoundUp(Convert.ToDouble(textBox4.Text.Trim()) * (double)Convert.ToInt32(textBox5.Text.Trim()), 0).ToString();
		}
		else if (e.CommandName == "TinhTienShipEdit")
		{
			DropDownList dropDownList3 = gvShipVeVN.Rows[gvShipVeVN.EditIndex].FindControl("ddgvLoaiHangShip") as DropDownList;
			TextBox textBox7 = gvShipVeVN.Rows[gvShipVeVN.EditIndex].FindControl("tbgvCanNang") as TextBox;
			TextBox textBox8 = gvShipVeVN.Rows[gvShipVeVN.EditIndex].FindControl("tbgvDonGia") as TextBox;
			TextBox textBox9 = gvShipVeVN.Rows[gvShipVeVN.EditIndex].FindControl("tbgvTongTienShipVeVN_VND") as TextBox;
			textBox8.Text = dBConnect.LayDonGiaLoaiHangShip(Convert.ToInt32(dropDownList3.SelectedValue)).ToString();
			textBox9.Text = EnhancedMath.RoundUp(Convert.ToDouble(textBox7.Text.Trim()) * (double)Convert.ToInt32(textBox8.Text.Trim()), 0).ToString();
		}
	}

	protected void gvShipVeVN_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvShipVeVN.EditIndex = e.NewEditIndex;
			LoadDataLoHang_PhiShipVeVN(Convert.ToInt32(Page.Request.QueryString["id"]));
		}
		catch (Exception)
		{
		}
	}

	protected void gvShipVeVN_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			int loHangID = Convert.ToInt32(Page.Request.QueryString["id"]);
			int loHang_PhiShipVeVNID = Convert.ToInt32(gvShipVeVN.DataKeys[e.RowIndex]["LoHang_PhiShipVeVNID"]);
			DropDownList dropDownList = gvShipVeVN.Rows[e.RowIndex].FindControl("ddgvLoaiHangShip") as DropDownList;
			TextBox textBox = gvShipVeVN.Rows[e.RowIndex].FindControl("tbgvCanNang") as TextBox;
			TextBox textBox2 = gvShipVeVN.Rows[e.RowIndex].FindControl("tbgvDonGia") as TextBox;
			TextBox textBox3 = gvShipVeVN.Rows[e.RowIndex].FindControl("tbgvTongTienShipVeVN_VND") as TextBox;
			dBConnect.CapNhatLoHang_PhiShipVeVN(loHang_PhiShipVeVNID, loHangID, Convert.ToInt32(dropDownList.SelectedValue), Convert.ToDouble(textBox.Text.Trim()), Convert.ToInt32(textBox2.Text.Trim()), Convert.ToInt32(textBox3.Text.Trim()), base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "LoHang_ChiTiet:SuaPhiShipVeVN", StringEnum.GetStringValue(HanhDong.ChinhSua), loHang_PhiShipVeVNID.ToString(), "LoHang_PhiShipVeVNID: " + loHang_PhiShipVeVNID + "LoHangID: " + loHangID + "LoaiHangShip: " + dropDownList.SelectedValue + "CanNang: " + textBox.Text.Trim() + "DonGia: " + textBox2.Text.Trim() + "TongTienShipVeVN_VND: " + textBox3.Text.Trim());
			gvShipVeVN.EditIndex = -1;
			LoadDataLoHang_PhiShipVeVN(loHangID);
		}
		catch (Exception)
		{
		}
	}

	protected void gvShipVeVN_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvShipVeVN.EditIndex = -1;
		LoadDataLoHang_PhiShipVeVN(Convert.ToInt32(Page.Request.QueryString["id"]));
	}

	protected void gvShipVeVN_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int loHang_PhiShipVeVNID = Convert.ToInt32(gvShipVeVN.DataKeys[e.RowIndex]["LoHang_PhiShipVeVNID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaLoHang_PhiShipVeVN(loHang_PhiShipVeVNID, base.User.Identity.GetUserName()))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "LoHang_ChiTiet:XoaPhiShipVeVN", StringEnum.GetStringValue(HanhDong.Xoa), loHang_PhiShipVeVNID.ToString(), "ID: " + loHang_PhiShipVeVNID);
				LoadDataLoHang_PhiShipVeVN(Convert.ToInt32(Page.Request.QueryString["id"]));
			}
		}
		catch
		{
		}
	}

	private void LoadDataLoHang_ThueHaiQuan(int LoHangID)
	{
		DBConnect dBConnect = new DBConnect();
		DataSet dataSet = dBConnect.LayDanhSachLoHang_ThueHaiQuanByID(LoHangID);
		if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
		{
			gvThueHaiQuan.DataKeyNames = new string[1] { "LoHang_ThueHaiQuanID" };
			gvThueHaiQuan.DataSource = dataSet;
		}
		else
		{
			gvThueHaiQuan.DataKeyNames = new string[0];
			gvThueHaiQuan.DataSource = new object[1];
		}
		gvThueHaiQuan.DataBind();
	}

	protected void gvThueHaiQuan_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && e.Row.DataItem == null)
		{
			e.Row.Visible = false;
		}
		if (e.Row.RowType != DataControlRowType.DataRow || (e.Row.RowState & DataControlRowState.Edit) != DataControlRowState.Edit)
		{
			return;
		}
		DBConnect dBConnect = new DBConnect();
		DropDownList dropDownList = (DropDownList)e.Row.FindControl("ddgvLoaiHangThueHaiQuan");
		dropDownList.DataSource = dBConnect.LayDanhSachLoaiHangThueHaiQuan();
		dropDownList.DataBind();
		try
		{
			dropDownList.ClearSelection();
			ListItem listItem = dropDownList.Items.FindByValue(DataBinder.Eval(e.Row.DataItem, "LoaiHangThueHaiQuanID").ToString());
			if (listItem != null)
			{
				listItem.Selected = true;
			}
		}
		catch
		{
		}
	}

	protected void gvThueHaiQuan_DataBound(object sender, EventArgs e)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DropDownList dropDownList = gvThueHaiQuan.FooterRow.FindControl("ddLoaiHangThueHaiQuan") as DropDownList;
			dropDownList.DataSource = dBConnect.LayDanhSachLoaiHangThueHaiQuan();
			dropDownList.DataBind();
		}
		catch
		{
		}
	}

	protected void gvThueHaiQuan_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		int loHangID = Convert.ToInt32(Page.Request.QueryString["id"]);
		if (e.CommandName == "Insert")
		{
			DropDownList dropDownList = gvThueHaiQuan.FooterRow.FindControl("ddLoaiHangThueHaiQuan") as DropDownList;
			TextBox textBox = gvThueHaiQuan.FooterRow.FindControl("tbftCanNangSoLuongGiaTri") as TextBox;
			TextBox textBox2 = gvThueHaiQuan.FooterRow.FindControl("tbftDonGia") as TextBox;
			TextBox textBox3 = gvThueHaiQuan.FooterRow.FindControl("tbftTongTienThueHaiQuan_VND") as TextBox;
			if (dBConnect.ThemLoHang_ThueHaiQuan(loHangID, Convert.ToInt32(dropDownList.SelectedValue), Convert.ToDouble(textBox.Text.Trim()), Convert.ToDouble(textBox2.Text.Trim()), Convert.ToInt32(textBox3.Text.Trim()), base.User.Identity.GetUserName()))
			{
				LoadDataLoHang_ThueHaiQuan(loHangID);
			}
		}
		else if (e.CommandName == "TinhTienThueHaiQuanFooter")
		{
			DropDownList dropDownList2 = gvThueHaiQuan.FooterRow.FindControl("ddLoaiHangThueHaiQuan") as DropDownList;
			TextBox textBox4 = gvThueHaiQuan.FooterRow.FindControl("tbftCanNangSoLuongGiaTri") as TextBox;
			TextBox textBox5 = gvThueHaiQuan.FooterRow.FindControl("tbftDonGia") as TextBox;
			TextBox textBox6 = gvThueHaiQuan.FooterRow.FindControl("tbftTongTienThueHaiQuan_VND") as TextBox;
			textBox5.Text = dBConnect.LayDonGiaLoaiHangThueHaiQuan(Convert.ToInt32(dropDownList2.SelectedValue)).ToString();
			textBox6.Text = EnhancedMath.RoundUp(Convert.ToDouble(textBox4.Text.Trim()) * Convert.ToDouble(textBox5.Text.Trim()), 0).ToString();
		}
		else if (e.CommandName == "TinhTienThueHaiQuanEdit")
		{
			DropDownList dropDownList3 = gvThueHaiQuan.Rows[gvThueHaiQuan.EditIndex].FindControl("ddgvLoaiHangThueHaiQuan") as DropDownList;
			TextBox textBox7 = gvThueHaiQuan.Rows[gvThueHaiQuan.EditIndex].FindControl("tbgvCanNangSoLuongGiaTri") as TextBox;
			TextBox textBox8 = gvThueHaiQuan.Rows[gvThueHaiQuan.EditIndex].FindControl("tbgvDonGia") as TextBox;
			TextBox textBox9 = gvThueHaiQuan.Rows[gvThueHaiQuan.EditIndex].FindControl("tbgvTongTienThueHaiQuan_VND") as TextBox;
			textBox8.Text = dBConnect.LayDonGiaLoaiHangThueHaiQuan(Convert.ToInt32(dropDownList3.SelectedValue)).ToString();
			textBox9.Text = EnhancedMath.RoundUp(Convert.ToDouble(textBox7.Text.Trim()) * Convert.ToDouble(textBox8.Text.Trim()), 0).ToString();
		}
	}

	protected void gvThueHaiQuan_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvThueHaiQuan.EditIndex = e.NewEditIndex;
			LoadDataLoHang_ThueHaiQuan(Convert.ToInt32(Page.Request.QueryString["id"]));
		}
		catch (Exception)
		{
		}
	}

	protected void gvThueHaiQuan_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			int loHangID = Convert.ToInt32(Page.Request.QueryString["id"]);
			int loHang_ThueHaiQuanID = Convert.ToInt32(gvThueHaiQuan.DataKeys[e.RowIndex]["LoHang_ThueHaiQuanID"]);
			DropDownList dropDownList = gvThueHaiQuan.Rows[e.RowIndex].FindControl("ddgvLoaiHangThueHaiQuan") as DropDownList;
			TextBox textBox = gvThueHaiQuan.Rows[e.RowIndex].FindControl("tbgvCanNangSoLuongGiaTri") as TextBox;
			TextBox textBox2 = gvThueHaiQuan.Rows[e.RowIndex].FindControl("tbgvDonGia") as TextBox;
			TextBox textBox3 = gvThueHaiQuan.Rows[e.RowIndex].FindControl("tbgvTongTienThueHaiQuan_VND") as TextBox;
			dBConnect.CapNhatLoHang_ThueHaiQuan(loHang_ThueHaiQuanID, loHangID, Convert.ToInt32(dropDownList.SelectedValue), Convert.ToDouble(textBox.Text.Trim()), Convert.ToDouble(textBox2.Text.Trim()), Convert.ToInt32(textBox3.Text.Trim()), base.User.Identity.GetUserName());
			gvThueHaiQuan.EditIndex = -1;
			LoadDataLoHang_ThueHaiQuan(loHangID);
		}
		catch (Exception)
		{
		}
	}

	protected void gvThueHaiQuan_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvThueHaiQuan.EditIndex = -1;
		LoadDataLoHang_ThueHaiQuan(Convert.ToInt32(Page.Request.QueryString["id"]));
	}

	protected void gvThueHaiQuan_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int loHang_ThueHaiQuanID = Convert.ToInt32(gvThueHaiQuan.DataKeys[e.RowIndex]["LoHang_ThueHaiQuanID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaLoHang_ThueHaiQuan(loHang_ThueHaiQuanID, base.User.Identity.GetUserName()))
			{
				LoadDataLoHang_ThueHaiQuan(Convert.ToInt32(Page.Request.QueryString["id"]));
			}
		}
		catch
		{
		}
	}

	private void LoadDanhTracking()
	{
		BLL bLL = new BLL();
		TrackingPhanTrang trackingPhanTrang = bLL.LayDanhSachTracking(ddUserName.SelectedValue, "", "", -1, "", lbLoHang.Text, -1, DaXoa: false, "", "", 10000, 1);
		gvTracking.DataSource = trackingPhanTrang.DanhSachTracking;
		gvTracking.DataBind();
	}
}
