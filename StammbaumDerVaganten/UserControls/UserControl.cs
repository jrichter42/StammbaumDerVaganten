using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace StammbaumDerVaganten
{
    public class UserControl : System.Windows.Controls.UserControl, INotifyPropertyChanged
    {
        #region INotifyPropertyChanged
        public virtual event PropertyChangedEventHandler PropertyChanged;

        protected void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged is not null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        public static readonly DependencyProperty ShowIDsProperty =
        DependencyProperty.Register(
            name: "ShowIDs",
            propertyType: typeof(bool),
            ownerType: typeof(UserControl),
            typeMetadata: new FrameworkPropertyMetadata(
                defaultValue: false,
                propertyChangedCallback: (source, e) => { (source as UserControl)?.NotifyPropertyChanged("IDColumnVisibility"); }
            )
        );

        public bool ShowIDs
        {
            get => (bool)GetValue(ShowIDsProperty);
            set => SetValue(ShowIDsProperty, value);
        }

        public Visibility IDColumnVisibility
        {
            get
            {
                return ShowIDs ? Visibility.Visible : Visibility.Hidden;
            }
        }

        public UserControl()
        {
            Resources.Add("UserControl", this);
        }
    }
}
