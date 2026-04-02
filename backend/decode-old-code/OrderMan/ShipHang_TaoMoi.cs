using System;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class ShipHang_TaoMoi : Page
{
	protected Label lbLoi;

	protected DropDownList ddShipper;

	protected Label lbHoTen;

	protected Label lbUserName;

	protected Label lbEmail;

	protected Label lbDiaChi;

	protected Label lbTinhThanh;

	protected Label lbPhoneNumber;

	protected TextBox tbSoVanDon;

	protected TextBox tbNgayGuiHang;

	protected TextBox tbKhoiLuong;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			string text = Page.Request.QueryString["id"];
			string text2 = Page.Request.QueryString["us"];
			if (!string.IsNullOrEmpty(text) && !string.IsNullOrEmpty(text2))
			{
				lbLoi.Text = "Đang xử lý những ID " + text;
				LoadThongTinUser(text2);
				LoadShipper();
			}
		}
	}

	private void LoadShipper()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LayDanhSachShipper();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				ddShipper.DataSource = dataSet.Tables[0];
				ddShipper.DataBind();
			}
		}
		catch
		{
		}
	}

	private void LoadThongTinUser(string username)
	{
		UserManager manager = new UserManager();
		ApplicationUser applicationUser = manager.FindByName(username);
		lbHoTen.Text = applicationUser.HoTen;
		lbUserName.Text = applicationUser.UserName;
		lbEmail.Text = applicationUser.Email;
		lbDiaChi.Text = applicationUser.DiaChi;
		lbTinhThanh.Text = applicationUser.TinhThanh;
		lbPhoneNumber.Text = applicationUser.PhoneNumber;
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		if (string.IsNullOrEmpty(tbNgayGuiHang.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập ngày gửi hàng";
			return;
		}
		if (string.IsNullOrEmpty(tbKhoiLuong.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập khối lượng";
			return;
		}
		if (!double.TryParse(tbKhoiLuong.Text.Trim(), out var result))
		{
			lbLoi.Text = "Khối lượng phải là kiểu số";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.CapNhatShipHang(Page.Request.QueryString["id"], Convert.ToInt32(ddShipper.SelectedValue), DateTimeUtil.getDatetimeFromStr(tbNgayGuiHang.Text.Trim()), tbSoVanDon.Text.Trim(), result, base.User.Identity.GetUserName()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "ShipHang_TaoMoi:CapNhatShipHang", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID: " + Page.Request.QueryString["id"] + "; Shipper" + ddShipper.SelectedValue + "; NgayGuiHang" + tbNgayGuiHang.Text.Trim() + "; SoVanDon" + tbSoVanDon.Text.Trim() + "; KhoiLuong" + result);
			Page.Response.Redirect("/admin/ShipHang_LietKe.aspx");
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
