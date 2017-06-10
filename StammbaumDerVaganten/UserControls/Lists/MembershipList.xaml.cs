using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for Membershiplist.xaml
    /// </summary>
    public partial class Membershiplist : UserControl
    {
        protected ScoutVm scout;

        public ScoutVm Scout
        {
            get { return scout; }
            set
            {
                scout = value;
                pfadi_membershiplist.ItemsSource = scout.Memberships;
            }
        }

        public Membershiplist()
        {
            InitializeComponent();
        }

        private void pfadi_membershiplist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            if (scout == null)
            {
                return;
            }
            e.NewItem = scout.CreateMembership();
        }

        private void pfadi_list_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {

        }
    }
}
