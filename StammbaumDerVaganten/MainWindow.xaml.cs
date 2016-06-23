using System.Windows;
using System.Windows.Input;
using MahApps.Metro.Controls;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : MetroWindow
    {
        MainViewModel vm;

        public MainWindow()
        {
            InitializeComponent();
            vm = (MainViewModel)DataContext;
            if (Keyboard.PrimaryDevice.IsKeyDown(Key.Escape))
            {
                Application.Current.Shutdown();
            }
        }

        private void Load(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Load();
            pfadi_grouplist.ItemsSource = vm.Groups;
            pfadi_rolelist.ItemsSource = vm.Roles;
            pfadi_scoutlist.ItemsSource = vm.Scouts;
            OnScoutSelectionChanged();
        }

        private void Save(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Save();
        }

        private void OnScoutSelectionChanged()
        {
            int idx = pfadi_scoutlist.SelectedIndex;
            if (idx == -1 || vm.Scouts == null || idx >= vm.Scouts.Count)
            {
                pfadi_membershiplist.ItemsSource = null;
                pfadi_activitylist.ItemsSource = null;
                vm.FlushMemberActivityLists();
                return;
            }
            Scout scout = vm.Scouts[idx];
            if (scout != null)
            {
                vm.Memberships = scout.Memberships;
                vm.Activities = scout.Activities;
            }
            pfadi_membershiplist.ItemsSource = vm.Memberships;
            pfadi_activitylist.ItemsSource = vm.Activities;
        }

        private void pfadi_rolelist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Role(true);
        }

        private void pfadi_grouplist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Group(true);
        }

        private void pfadi_scoutlist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Scout();
        }

        private void pfadi_membershiplist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Membership();
        }

        private void pfadi_activitylist_AddingNewItem(object sender, System.Windows.Controls.AddingNewItemEventArgs e)
        {
            e.NewItem = new Activity();
        }

        private void pfadi_scoutlist_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            OnScoutSelectionChanged();
        }

        private void pfadi_scoutlist_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            OnScoutSelectionChanged();
        }
    }
}
