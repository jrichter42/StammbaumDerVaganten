using System.Windows;
using System.Windows.Input;
using MahApps.Metro.Controls;
using System.Windows.Controls;
using System.Collections.Generic;
using System;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : MetroWindow
    {
        public MainViewmodel MainVm
        {
            get { return (MainViewmodel)DataContext; }
        }

        public MainWindow()
        {
            DataContext = MainViewmodel.ActiveVm = new MainViewmodel();

            //Load(this, null);

#if DEBUG
            AddTestingData();
            MainViewmodel.ActiveVm.RebuildViewmodels();
            Save(this, null);
#endif

            InitializeComponent();

#if DEBUG
            GetWindow(this).KeyDown += OnKeyDown;

            // Advanced tab
            ((TabControl)FindName("TabControl")).SelectedIndex = 1;
#endif
        }

        private void Load(object sender, ExecutedRoutedEventArgs e)
        {
            MainVm.Load();
            
            //OnScoutSelectionChanged();
        }

        private void Save(object sender, ExecutedRoutedEventArgs e)
        {
            MainVm.Save();
        }

#if DEBUG
        private void OnKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Escape)
            {
                Application.Current.Shutdown();
            }
        }

        private void AddTestingData()
        {
            Database context = MainViewmodel.ActiveVm.Database;
            Data data = MainViewmodel.ActiveData;

            Role roleStafue = new Role(context, true, RoleType.Stammesfuehrung, GroupType.Stamm);
            Role roleStellvStafue = new Role(context, true, RoleType.StellvStammesfuehrung, GroupType.Stamm);
            Role roleKawa = new Role(context, true, RoleType.Kassenwart, GroupType.Stamm);
            Role roleStellvKawa = new Role(context, true, RoleType.StellvKassenwart, GroupType.Stamm);
            Role roleHandkasse = new Role(context, true, RoleType.Handkasse, GroupType.Stamm);
            Role roleMeufue = new Role(context, true, RoleType.Meutenfuehrung, GroupType.Meute);
            Role roleMeutenassi = new Role(context, true, RoleType.Meutenassistenz, GroupType.Meute);
            Role roleRudelfue = new Role(context, true, RoleType.Rudelfuehrung, GroupType.Rudel);
            Role roleSifue = new Role(context, true, RoleType.Sippenfuehrung, GroupType.Sippe);
            Role roleGildenspr = new Role(context, true, RoleType.Gildensprecher, GroupType.Gilde);
            Role roleRundenspr = new Role(context, true, RoleType.Rundensprecher, GroupType.Runde);
            Role roleKreisleit = new Role(context, true, RoleType.Kreisleitung, GroupType.Kreis);
            Role roleMatihueschlue = new Role(context, true, RoleType.Custom, "Matihüschlüwa", GroupType.Stamm);

            data.Roles.Add(roleStafue);
            data.Roles.Add(roleStellvStafue);
            data.Roles.Add(roleKawa);
            data.Roles.Add(roleStellvKawa);
            data.Roles.Add(roleHandkasse);
            data.Roles.Add(roleMeufue);
            data.Roles.Add(roleMeutenassi);
            data.Roles.Add(roleRudelfue);
            data.Roles.Add(roleSifue);
            data.Roles.Add(roleGildenspr);
            data.Roles.Add(roleRundenspr);
            data.Roles.Add(roleKreisleit);
            data.Roles.Add(roleMatihueschlue);


            Timepoint timepointStamm = new Timepoint(context, true, "Stammesgründung", new Date(new DateTime(1952, 01, 01)));
            Timepoint timepointPfila06 = new Timepoint(context, true, "Pfingstlager", new Date(new DateTime(2006, 06, 02)));
            Timepoint timepointNiko06 = new Timepoint(context, true, "Nikofahrt", new Date(new DateTime(2006, 11, 16)));
            Timepoint timepointNiko07 = new Timepoint(context, true, "Nikofahrt", new Date(new DateTime(2007, 12, 05)));
            Timepoint timepointPfila08 = new Timepoint(context, true, "Pfingstlager", new Date(new DateTime(2008, 05, 06)));
            Timepoint timepointNiko08 = new Timepoint(context, true, "Nikofahrt", new Date(new DateTime(2008, 11, 22)));
            Timepoint timepointPfila12 = new Timepoint(context, true, "Pfingstlager", new Date(new DateTime(2012, 06, 01)));

            data.Timepoints.Add(timepointStamm);
            data.Timepoints.Add(timepointPfila06);
            data.Timepoints.Add(timepointNiko06);
            data.Timepoints.Add(timepointNiko07);
            data.Timepoints.Add(timepointPfila08);
            data.Timepoints.Add(timepointNiko08);
            data.Timepoints.Add(timepointPfila12);


            Group groupStamm = new Group(context, true, "der Vaganten",
                new GroupPhase(GroupType.Stamm, new Timespan(timepointStamm, new Date(new DateTime(2000, 1, 1)))),
                new List<GroupPhase>(), "stammdervaganten.de");

            Group groupPhoenix = new Group(context, true, "Phönix",
                new GroupPhase(GroupType.Sippe, new Timespan(timepointNiko06, timepointPfila12)),
                new List<GroupPhase> {
                    new GroupPhase(GroupType.Rudel, new Timespan(timepointPfila06, timepointNiko06)),
                    new GroupPhase(GroupType.Runde, new Timespan(timepointPfila08, timepointPfila12))
                });

            data.Groups.Add(groupStamm);
            data.Groups.Add(groupPhoenix);


            Scout scoutBob = new Scout(context, true, "Bob", "Meister", "Baumeister",
                new Date(2001, 2, 1), "", "",
                new List<Membership> {
                    new Membership(context, true, groupStamm, new Timespan(new Date(2011), new Date(2022)))
                }, new List<Activity> {
                    new Activity(context, true, groupStamm, roleStafue, new Timespan(new Date(1960), timepointNiko06))
                });

            Scout scoutKlaus = new Scout(context, true, "Klaus", "Heinz", "",
                new Date(1985), "klaus@heinz.rocks", "",
                new List<Membership> {
                    new Membership(context, true, groupStamm, new Timespan(new Date(1997), new Date(2003)))
                }, new List<Activity> {
                    new Activity(context, true, groupStamm, roleStellvKawa, new Timespan(new Date(1999), new Date(2001)))
                });

            Scout scoutJaqueline = new Scout(context, true, "Jaqueline", "Holz", "",
                new Date(1997), "+49800321456", "dazu gekommen durch Klaus",
                new List<Membership> {
                    new Membership(context, true, groupStamm, new Timespan(new Date(2005), new Date(2010)))
                }, new List<Activity>());

            data.Scouts.Add(scoutBob);
            data.Scouts.Add(scoutKlaus);
            data.Scouts.Add(scoutJaqueline);
        }
#endif
    }
}
