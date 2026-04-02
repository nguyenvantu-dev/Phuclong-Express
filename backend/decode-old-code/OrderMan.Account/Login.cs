using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan.Account;

public class Login : Page
{
	protected PlaceHolder ErrorMessage;

	protected Literal FailureText;

	protected TextBox UserName;

	protected TextBox Password;

	protected CheckBox RememberMe;

	protected void Page_Load(object sender, EventArgs e)
	{
	}

	protected void LogIn(object sender, EventArgs e)
	{
		if (base.IsValid)
		{
			UserManager manager = new UserManager();
			ApplicationUser applicationUser = manager.Find(UserName.Text.Trim(), Password.Text.Trim());
			if (applicationUser != null)
			{
				IdentityHelper.SignIn(manager, applicationUser, RememberMe.Checked);
				IdentityHelper.RedirectToReturnUrl(base.Request.QueryString["ReturnUrl"], base.Response);
			}
			else
			{
				FailureText.Text = "Invalid username or password.";
				ErrorMessage.Visible = true;
			}
		}
	}
}
