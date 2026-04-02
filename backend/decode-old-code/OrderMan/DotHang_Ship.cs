using System;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class DotHang_Ship : Page
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

	protected TextBox tbPhiShipTrongNuoc;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			string text = Page.Request.QueryString["tdh"];
			string text2 = Page.Request.QueryString["us"];
			if (string.IsNullOrEmpty(text) || string.IsNullOrEmpty(text2))
			{
				Page.Response.Redirect("/admin/DotHang_LietKe.aspx");
				return;
			}
			lbLoi.Text = "Đang xử lý đợt hàng " + text;
			LoadThongTinUser(text2);
			LoadShipper();
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
		double result;
		if (string.IsNullOrEmpty(tbPhiShipTrongNuoc.Text.Trim()))
		{
			result = 0.0;
		}
		if (!double.TryParse(tbPhiShipTrongNuoc.Text.Trim(), out result))
		{
			lbLoi.Text = "Phí ship trong nước phải là kiểu số";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.CapNhatDotHang_Ship(Page.Request.QueryString["tdh"], Page.Request.QueryString["us"], Convert.ToInt32(ddShipper.SelectedValue), DateTimeUtil.getDatetimeFromStr(tbNgayGuiHang.Text.Trim()), tbSoVanDon.Text.Trim(), result, base.User.Identity.GetUserName()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DotHang_Ship:CapNhatDotHang_Ship", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["tdh"], "TenDotHang: " + Page.Request.QueryString["tdh"] + "; User: " + Page.Request.QueryString["us"] + "; Shipper: " + ddShipper.SelectedValue + "; NgayGuiHang: " + tbNgayGuiHang.Text.Trim() + "; SoVanDon: " + tbSoVanDon.Text.Trim() + "; PhiShipTrongNuoc: " + result);
			Page.Response.Redirect("/admin/DotHang_LietKe.aspx");
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
