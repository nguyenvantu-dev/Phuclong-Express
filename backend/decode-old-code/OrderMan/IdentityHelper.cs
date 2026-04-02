using System.Security.Claims;
using System.Web;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using OrderMan.Models;

namespace OrderMan;

public static class IdentityHelper
{
	public const string XsrfKey = "XsrfId";

	public const string ProviderNameKey = "providerName";

	public static void SignIn(UserManager manager, ApplicationUser user, bool isPersistent)
	{
		IAuthenticationManager authentication = HttpContext.Current.GetOwinContext().Authentication;
		authentication.SignOut("ExternalCookie");
		ClaimsIdentity claimsIdentity = manager.CreateIdentity(user, "ApplicationCookie");
		authentication.SignIn(new AuthenticationProperties
		{
			IsPersistent = isPersistent
		}, claimsIdentity);
	}

	public static string GetProviderNameFromRequest(HttpRequest request)
	{
		return request["providerName"];
	}

	public static string GetExternalLoginRedirectUrl(string accountProvider)
	{
		return "/Account/RegisterExternalLogin?providerName=" + accountProvider;
	}

	private static bool IsLocalUrl(string url)
	{
		return !string.IsNullOrEmpty(url) && ((url[0] == '/' && (url.Length == 1 || (url[1] != '/' && url[1] != '\\'))) || (url.Length > 1 && url[0] == '~' && url[1] == '/'));
	}

	public static void RedirectToReturnUrl(string returnUrl, HttpResponse response)
	{
		if (!string.IsNullOrEmpty(returnUrl) && IsLocalUrl(returnUrl))
		{
			response.Redirect(returnUrl);
		}
		else
		{
			response.Redirect("~/");
		}
	}
}
