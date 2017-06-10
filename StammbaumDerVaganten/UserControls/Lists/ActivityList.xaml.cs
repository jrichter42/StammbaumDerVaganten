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
    /// Interaction logic for Activitylist.xaml
    /// </summary>
    public partial class Activitylist : UserControl
    {
        protected ScoutVm scout;

        public ScoutVm Scout
        {
            get { return scout; }
            set
            {
                scout = value;
                pfadi_activitylist.ItemsSource = scout.Activities;
            }
        }

        public Activitylist()
        {
            InitializeComponent();
        }

        private void pfadi_activitylist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            if (scout == null)
            {
                return;
            }
            e.NewItem = scout.CreateActivity();
        }

        private void pfadi_list_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {

        }
    }
}
