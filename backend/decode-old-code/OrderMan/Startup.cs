using System;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Owin;

namespace OrderMan;

public class Startup
{
	public void ConfigureAuth(IAppBuilder app)
	{
		app.UseCookieAuthentication(new CookieAuthenticationOptions
		{
			ExpireTimeSpan = TimeSpan.FromMinutes(600.0),
			AuthenticationType = "ApplicationCookie",
			LoginPath = new PathString("/Account/Login")
		});
		app.UseExternalSignInCookie("ExternalCookie");
	}

	public void Configuration(IAppBuilder app)
	{
		ConfigureAuth(app);
	}
}
