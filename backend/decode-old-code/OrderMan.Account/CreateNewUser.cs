using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan.Account;

public class CreateNewUser : Page
{
	protected Literal ErrorMessage;

	protected TextBox UserName;

	protected TextBox Password;

	protected TextBox ConfirmPassword;

	protected TextBox tbHoTen;

	protected DropDownList ddVungMien;

	protected TextBox tbDiaChi;

	protected DropDownList ddTinhThanh;

	protected TextBox tbPhoneNumber;

	protected TextBox tbEmail;

	protected TextBox tbSoTaiKhoan;

	protected TextBox tbHinhThucNhanHang;

	protected CheckBox cbKhachBuon;

	protected TextBox tbLinkTaiKhoanMang;

	protected void CreateUser_Click(object sender, EventArgs e)
	{
		UserManager userManager = new UserManager();
		ApplicationUser user = new ApplicationUser
		{
			UserName = UserName.Text.Trim(),
			HoTen = tbHoTen.Text.Trim(),
			DiaChi = tbDiaChi.Text.Trim(),
			TinhThanh = ddTinhThanh.SelectedItem.Text.Trim(),
			PhoneNumber = tbPhoneNumber.Text.Trim(),
			Email = tbEmail.Text.Trim(),
			SoTaiKhoan = tbSoTaiKhoan.Text.Trim(),
			HinhThucNhanHang = tbHinhThucNhanHang.Text.Trim(),
			KhachBuon = cbKhachBuon.Checked,
			LinkTaiKhoanMang = tbLinkTaiKhoanMang.Text.Trim(),
			VungMien = ddVungMien.SelectedItem.Text.Trim()
		};
		userManager.UserValidator = new UserValidator<ApplicationUser>(userManager)
		{
			RequireUniqueEmail = false
		};
		IdentityResult identityResult = userManager.Create(user, Password.Text.Trim());
		if (identityResult.Succeeded)
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "CreateNewUser", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "UserName: " + UserName.Text.Trim() + "; HoTen: " + tbHoTen.Text.Trim() + "; DiaChi: " + tbDiaChi.Text.Trim() + "; TinhThanh: " + ddTinhThanh.SelectedItem.Text.Trim() + "; PhoneNumber: " + tbPhoneNumber.Text.Trim() + "; Email: " + tbEmail.Text.Trim() + "; SoTaiKhoan: " + tbSoTaiKhoan.Text.Trim() + "; HinhThucNhanHang: " + tbHinhThucNhanHang.Text.Trim() + "; KhachBuon: " + cbKhachBuon.Checked + "; LinkTaiKhoanMang: " + tbLinkTaiKhoanMang.Text.Trim() + "; VungMien: " + ddVungMien.SelectedItem.Text.Trim());
			base.Response.Redirect("~/Admin/ListUser.aspx");
		}
		else
		{
			ErrorMessage.Text = identityResult.Errors.FirstOrDefault();
		}
	}

	protected void Cancel_Click(object sender, EventArgs e)
	{
		base.Response.Redirect("~/Admin/ListUser.aspx");
	}
}
