using System;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using OrderMan.Models;

namespace OrderMan.Account;

public class RegisterExternalLogin : Page
{
	protected TextBox userName;

	protected string ProviderName
	{
		get
		{
			return ((string)ViewState["ProviderName"]) ?? string.Empty;
		}
		private set
		{
			ViewState["ProviderName"] = value;
		}
	}

	protected string ProviderAccountKey
	{
		get
		{
			return ((string)ViewState["ProviderAccountKey"]) ?? string.Empty;
		}
		private set
		{
			ViewState["ProviderAccountKey"] = value;
		}
	}

	protected void Page_Load()
	{
		ProviderName = IdentityHelper.GetProviderNameFromRequest(base.Request);
		if (string.IsNullOrEmpty(ProviderName))
		{
			base.Response.Redirect("~/Account/Login");
		}
		if (base.IsPostBack)
		{
			return;
		}
		UserManager manager = new UserManager();
		ExternalLoginInfo externalLoginInfo = Context.GetOwinContext().Authentication.GetExternalLoginInfo();
		if (externalLoginInfo == null)
		{
			base.Response.Redirect("~/Account/Login");
		}
		ApplicationUser applicationUser = manager.Find(externalLoginInfo.Login);
		if (applicationUser != null)
		{
			IdentityHelper.SignIn(manager, applicationUser, isPersistent: false);
			IdentityHelper.RedirectToReturnUrl(base.Request.QueryString["ReturnUrl"], base.Response);
		}
		else if (base.User.Identity.IsAuthenticated)
		{
			ExternalLoginInfo externalLoginInfo2 = Context.GetOwinContext().Authentication.GetExternalLoginInfo("XsrfId", base.User.Identity.GetUserId());
			if (externalLoginInfo2 == null)
			{
				base.Response.Redirect("~/Account/Login");
			}
			IdentityResult identityResult = manager.AddLogin(base.User.Identity.GetUserId(), externalLoginInfo2.Login);
			if (identityResult.Succeeded)
			{
				IdentityHelper.RedirectToReturnUrl(base.Request.QueryString["ReturnUrl"], base.Response);
			}
			else
			{
				AddErrors(identityResult);
			}
		}
		else
		{
			userName.Text = externalLoginInfo.DefaultUserName;
		}
	}

	protected void LogIn_Click(object sender, EventArgs e)
	{
		CreateAndLoginUser();
	}

	private void CreateAndLoginUser()
	{
		if (!base.IsValid)
		{
			return;
		}
		UserManager manager = new UserManager();
		ApplicationUser applicationUser = new ApplicationUser
		{
			UserName = userName.Text.Trim()
		};
		IdentityResult identityResult = manager.Create(applicationUser);
		if (identityResult.Succeeded)
		{
			ExternalLoginInfo externalLoginInfo = Context.GetOwinContext().Authentication.GetExternalLoginInfo();
			if (externalLoginInfo == null)
			{
				base.Response.Redirect("~/Account/Login");
				return;
			}
			identityResult = manager.AddLogin(applicationUser.Id, externalLoginInfo.Login);
			if (identityResult.Succeeded)
			{
				IdentityHelper.SignIn(manager, applicationUser, isPersistent: false);
				IdentityHelper.RedirectToReturnUrl(base.Request.QueryString["ReturnUrl"], base.Response);
				return;
			}
		}
		AddErrors(identityResult);
	}

	private void AddErrors(IdentityResult result)
	{
		foreach (string error in result.Errors)
		{
			base.ModelState.AddModelError("", error);
		}
	}
}
