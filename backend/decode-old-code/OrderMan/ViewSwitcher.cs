using System;
using System.Web;
using System.Web.Routing;
using System.Web.UI;
using Microsoft.AspNet.FriendlyUrls.Resolvers;

namespace OrderMan;

public class ViewSwitcher : UserControl
{
	protected string CurrentView { get; private set; }

	protected string AlternateView { get; private set; }

	protected string SwitchUrl { get; private set; }

	protected void Page_Load(object sender, EventArgs e)
	{
		bool flag = WebFormsFriendlyUrlResolver.IsMobileView(new HttpContextWrapper(Context));
		CurrentView = (flag ? "Mobile" : "Desktop");
		AlternateView = (flag ? "Desktop" : "Mobile");
		string text = "AspNet.FriendlyUrls.SwitchView";
		RouteBase routeBase = RouteTable.Routes[text];
		if (routeBase == null)
		{
			Visible = false;
			return;
		}
		string routeUrl = GetRouteUrl(text, new
		{
			view = AlternateView,
			__FriendlyUrls_SwitchViews = true
		});
		routeUrl = routeUrl + "?ReturnUrl=" + HttpUtility.UrlEncode(base.Request.RawUrl);
		SwitchUrl = routeUrl;
	}
}
