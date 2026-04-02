using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan.Account;

public class Manage : Page
{
	protected PlaceHolder successMessage;

	protected PlaceHolder setPassword;

	protected TextBox password;

	protected TextBox confirmPassword;

	protected PlaceHolder changePasswordHolder;

	protected Label CurrentPasswordLabel;

	protected TextBox CurrentPassword;

	protected Label NewPasswordLabel;

	protected TextBox NewPassword;

	protected Label ConfirmNewPasswordLabel;

	protected TextBox ConfirmNewPassword;

	protected string SuccessMessage { get; private set; }

	protected bool CanRemoveExternalLogins { get; private set; }

	private bool HasPassword(UserManager manager)
	{
		ApplicationUser applicationUser = manager.FindById(base.User.Identity.GetUserId());
		return applicationUser != null && applicationUser.PasswordHash != null;
	}

	protected void Page_Load()
	{
		if (!base.IsPostBack)
		{
			UserManager manager = new UserManager();
			if (HasPassword(manager))
			{
				changePasswordHolder.Visible = true;
			}
			else
			{
				setPassword.Visible = true;
				changePasswordHolder.Visible = false;
			}
			CanRemoveExternalLogins = manager.GetLogins(base.User.Identity.GetUserId()).Count() > 1;
			string text = base.Request.QueryString["m"];
			if (text != null)
			{
				base.Form.Action = ResolveUrl("~/Account/Manage");
				SuccessMessage = text switch
				{
					"RemoveLoginSuccess" => "The account was removed.", 
					"SetPwdSuccess" => "Your password has been set.", 
					"ChangePwdSuccess" => "Your password has been changed.", 
					_ => string.Empty, 
				};
				successMessage.Visible = !string.IsNullOrEmpty(SuccessMessage);
			}
		}
	}

	protected void ChangePassword_Click(object sender, EventArgs e)
	{
		if (base.IsValid)
		{
			UserManager manager = new UserManager();
			IdentityResult identityResult = manager.ChangePassword(base.User.Identity.GetUserId(), CurrentPassword.Text.Trim(), NewPassword.Text.Trim());
			if (identityResult.Succeeded)
			{
				base.Response.Redirect("~/Account/Manage?m=ChangePwdSuccess");
			}
			else
			{
				AddErrors(identityResult);
			}
		}
	}

	protected void SetPassword_Click(object sender, EventArgs e)
	{
		if (base.IsValid)
		{
			UserManager manager = new UserManager();
			IdentityResult identityResult = manager.AddPassword(base.User.Identity.GetUserId(), password.Text.Trim());
			if (identityResult.Succeeded)
			{
				base.Response.Redirect("~/Account/Manage?m=SetPwdSuccess");
			}
			else
			{
				AddErrors(identityResult);
			}
		}
	}

	public IEnumerable<UserLoginInfo> GetLogins()
	{
		UserManager manager = new UserManager();
		IList<UserLoginInfo> logins = manager.GetLogins(base.User.Identity.GetUserId());
		CanRemoveExternalLogins = logins.Count() > 1 || HasPassword(manager);
		return logins;
	}

	public void RemoveLogin(string loginProvider, string providerKey)
	{
		UserManager manager = new UserManager();
		IdentityResult identityResult = manager.RemoveLogin(base.User.Identity.GetUserId(), new UserLoginInfo(loginProvider, providerKey));
		string text = (identityResult.Succeeded ? "?m=RemoveLoginSuccess" : string.Empty);
		base.Response.Redirect("~/Account/Manage" + text);
	}

	private void AddErrors(IdentityResult result)
	{
		foreach (string error in result.Errors)
		{
			base.ModelState.AddModelError("", error);
		}
	}
}
