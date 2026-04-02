using System.Web.Routing;
using Microsoft.AspNet.FriendlyUrls;

namespace OrderMan;

public static class RouteConfig
{
	public static void RegisterRoutes(RouteCollection routes)
	{
		FriendlyUrlSettings friendlyUrlSettings = new FriendlyUrlSettings();
		friendlyUrlSettings.AutoRedirectMode = RedirectMode.Permanent;
		routes.EnableFriendlyUrls(friendlyUrlSettings);
	}
}
