using System;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan.Account;

public class Register : Page
{
	protected Literal ErrorMessage;

	protected TextBox UserName;

	protected TextBox Password;

	protected TextBox ConfirmPassword;

	protected TextBox tbHoTen;

	protected TextBox tbDiaChi;

	protected DropDownList ddTinhThanh;

	protected TextBox tbPhoneNumber;

	protected TextBox tbEmail;

	protected TextBox tbSoTaiKhoan;

	protected TextBox tbHinhThucNhanHang;

	protected void CreateUser_Click(object sender, EventArgs e)
	{
		UserManager manager = new UserManager();
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
			KhachBuon = false
		};
		IdentityResult identityResult = manager.Create(user, Password.Text.Trim());
		if (identityResult.Succeeded)
		{
			IdentityHelper.SignIn(manager, user, isPersistent: false);
			IdentityHelper.RedirectToReturnUrl(base.Request.QueryString["ReturnUrl"], base.Response);
		}
		else
		{
			ErrorMessage.Text = identityResult.Errors.FirstOrDefault();
		}
	}
}
