using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;

namespace OrderMan.Account;

public class OpenAuthProviders : UserControl
{
	protected ListView providerDetails;

	public string ReturnUrl { get; set; }

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			return;
		}
		string text = base.Request.Form["provider"];
		if (text != null)
		{
			string redirectUri = ResolveUrl(string.Format(CultureInfo.InvariantCulture, "~/Account/RegisterExternalLogin?{0}={1}&returnUrl={2}", new object[3] { "providerName", text, ReturnUrl }));
			AuthenticationProperties authenticationProperties = new AuthenticationProperties
			{
				RedirectUri = redirectUri
			};
			if (Context.User.Identity.IsAuthenticated)
			{
				authenticationProperties.Dictionary["XsrfId"] = Context.User.Identity.GetUserId();
			}
			Context.GetOwinContext().Authentication.Challenge(authenticationProperties, text);
			base.Response.StatusCode = 401;
			base.Response.End();
		}
	}

	public IEnumerable<string> GetProviderNames()
	{
		return from t in Context.GetOwinContext().Authentication.GetExternalAuthenticationTypes()
			select t.AuthenticationType;
	}
}
